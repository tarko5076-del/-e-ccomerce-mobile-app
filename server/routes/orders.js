const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyAdmin } = require('../middleware/adminAuth');

// Get all orders (Admin panel)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { date: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        },
        payment: true
      }
    });

    const formattedOrders = orders.map(o => ({
      id: o.id,
      customer: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      total: o.total,
      status: o.status,
      date: o.date.toISOString().split('T')[0],
      items: o.items.map(item => item.product.name),
      itemsDetails: o.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        image: item.product.id // placeholder or id
      })),
      address: o.address,
      method: o.method,
      userId: o.userId,
      paymentStatus: o.payment?.status || 'unpaid'
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'An error occurred while fetching orders.' });
  }
});

// Get orders for a specific user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.params.userId },
      orderBy: { date: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        },
        payment: true
      }
    });

    const formattedOrders = orders.map(o => ({
      id: o.id,
      customer: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      total: o.total,
      status: o.status,
      date: o.date.toISOString().split('T')[0],
      items: o.items.map(item => item.product.name),
      itemsDetails: o.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity
      })),
      address: o.address,
      method: o.method,
      userId: o.userId,
      paymentStatus: o.payment?.status || 'unpaid'
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'An error occurred while fetching user orders.' });
  }
});

// Create a new order (from checkout)
router.post('/', async (req, res) => {
  const { id, customerName, customerEmail, customerPhone, total, items, address, method, userId } = req.body;
  if (!customerName || !customerEmail || total === undefined || !items || !address || !method) {
    return res.status(400).json({ error: 'customerName, customerEmail, total, items, address and method are required.' });
  }

  try {
    const orderId = id || 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    // Create order inside a transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          id: orderId,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone ? customerPhone.trim() : null,
          total: parseFloat(total),
          status: 'pending',
          address: address.trim(),
          method: method.trim(),
          userId: userId || null
        }
      });

      // 2. Parse items and create OrderItems + decrease product stock
      if (Array.isArray(items)) {
        for (const item of items) {
          let productId = null;
          let price = 0;
          let quantity = 1;

          if (typeof item === 'object' && item !== null) {
            productId = item.id || item.productId;
            price = parseFloat(item.price) || 0;
            quantity = parseInt(item.quantity) || 1;
          } else if (typeof item === 'string') {
            // Find product by name
            const prod = await tx.product.findFirst({
              where: { name: { equals: item, mode: 'insensitive' } }
            });
            if (prod) {
              productId = prod.id;
              price = prod.price;
            }
          }

          if (productId) {
            await tx.orderItem.create({
              data: {
                orderId: newOrder.id,
                productId,
                quantity,
                price
              }
            });

            // Decrease stock
            await tx.product.update({
              where: { id: productId },
              data: {
                stock: {
                  decrement: quantity
                }
              }
            });
          }
        }
      }

      return newOrder;
    });

    // 3. Initiate payment with Chapa if selected
    let checkoutUrl = null;
    const isChapa = method.toLowerCase().includes('chapa');
    
    if (isChapa) {
      const tx_ref = `TX-ELECTRO-${order.id}-${Math.floor(1000 + Math.random() * 9000)}`;
      const nameParts = customerName.trim().split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';
      
      const chapaSecret = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-MOCKSECRETKEY123456789';
      
      try {
        const chapaRes = await fetch('https://api.chapa.co/v1/transaction/initialize', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${chapaSecret}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: total.toString(),
            currency: 'ETB',
            email: customerEmail,
            first_name: firstName,
            last_name: lastName,
            tx_ref: tx_ref,
            callback_url: `http://localhost:5000/api/orders/webhook`,
            return_url: `http://localhost:5000/api/orders/verify-redirect?tx_ref=${tx_ref}`,
            customization: {
              title: 'ElectroHub Purchase',
              description: `Payment for Order ${order.id}`
            }
          })
        });
        
        const chapaData = await chapaRes.json();
        if (chapaRes.ok && chapaData.status === 'success') {
          checkoutUrl = chapaData.data.checkout_url;
          
          await prisma.payment.create({
            data: {
              orderId: order.id,
              transactionId: tx_ref,
              amount: parseFloat(total),
              status: 'pending',
              method: 'Chapa'
            }
          });
        } else {
          console.warn('Chapa API failed, falling back to mock link:', chapaData);
          checkoutUrl = `https://checkout.chapa.co/checkout/payment/mock-checkout-${tx_ref}`;
          await prisma.payment.create({
            data: {
              orderId: order.id,
              transactionId: tx_ref,
              amount: parseFloat(total),
              status: 'pending',
              method: 'Chapa'
            }
          });
        }
      } catch (err) {
        console.error('Error contacting Chapa, using mock:', err);
        checkoutUrl = `https://checkout.chapa.co/checkout/payment/mock-checkout-${tx_ref}`;
        await prisma.payment.create({
          data: {
            orderId: order.id,
            transactionId: tx_ref,
            amount: parseFloat(total),
            status: 'pending',
            method: 'Chapa'
          }
        });
      }
    }

    res.status(201).json({
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      total: order.total,
      status: order.status,
      address: order.address,
      method: order.method,
      userId: order.userId,
      checkoutUrl: checkoutUrl,
      txRef: isChapa ? tx_ref : null
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'An error occurred while creating order.' });
  }
});

// Verify transaction via API (called by mobile app to check status)
router.get('/verify/:tx_ref', async (req, res) => {
  const { tx_ref } = req.params;

  try {
    const payment = await prisma.payment.findUnique({
      where: { transactionId: tx_ref },
      include: { order: true }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment transaction not found.' });
    }

    // If already successful, return immediately
    if (payment.status === 'success') {
      return res.json({ success: true, status: 'success', orderId: payment.orderId });
    }

    const chapaSecret = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-MOCKSECRETKEY123456789';
    let verified = false;

    // Call Chapa verification if it's not a mock reference
    if (!tx_ref.includes('mock-checkout')) {
      try {
        const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${chapaSecret}`
          }
        });
        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.status === 'success' && verifyData.data?.status === 'success') {
          verified = true;
        }
      } catch (err) {
        console.error('Error calling Chapa verification:', err);
      }
    } else {
      // Mock transaction always succeeds for testing!
      verified = true;
    }

    if (verified) {
      // Update payment and order status
      await prisma.$transaction([
        prisma.payment.update({
          where: { transactionId: tx_ref },
          data: { status: 'success' }
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'paid' }
        })
      ]);

      return res.json({ success: true, status: 'success', orderId: payment.orderId });
    }

    res.json({ success: false, status: 'pending', orderId: payment.orderId });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    res.status(500).json({ error: 'An error occurred during verification.' });
  }
});

// Redirect target page after Chapa payment completion
router.get('/verify-redirect', async (req, res) => {
  const { tx_ref } = req.query;
  if (!tx_ref) {
    return res.status(400).send('Transaction reference is required');
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { transactionId: tx_ref }
    });

    if (!payment) {
      return res.status(404).send('Transaction not found');
    }

    let success = false;
    const chapaSecret = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-MOCKSECRETKEY123456789';

    if (!tx_ref.includes('mock-checkout')) {
      try {
        const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${chapaSecret}`
          }
        });
        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.status === 'success' && verifyData.data?.status === 'success') {
          success = true;
        }
      } catch (err) {
        console.error('Verify redirect API error:', err);
      }
    } else {
      success = true;
    }

    if (success) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { transactionId: tx_ref },
          data: { status: 'success' }
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'paid' }
        })
      ]);
    }

    // Send a premium feedback HTML page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment ${success ? 'Successful' : 'Pending'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f3f4f6; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          .card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: center; max-width: 400px; width: 90%; }
          .icon { font-size: 64px; margin-bottom: 20px; }
          h1 { color: #111827; font-size: 24px; margin-bottom: 10px; }
          p { color: #6b7280; font-size: 15px; line-height: 1.5; margin-bottom: 30px; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; transition: background 0.2s; }
          .btn:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">${success ? '✅' : '⏳'}</div>
          <h1>Payment ${success ? 'Successful!' : 'Processing'}</h1>
          <p>${success ? 'Thank you for your purchase. Your payment was verified successfully and your order has been updated.' : 'We are waiting for confirmation of your transaction.'}</p>
          <a href="#" onclick="window.close()" class="btn">Close Window</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Verify redirect error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Update order status (Admin)
router.put('/:id/status', verifyAdmin, async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid order status value.' });
  }

  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: status.toLowerCase() }
    });
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'An error occurred while updating order status.' });
  }
});

module.exports = router;
