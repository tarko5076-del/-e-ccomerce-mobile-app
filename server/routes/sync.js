const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Sync whole cart (overwrite server cart with client cart)
router.post('/cart', async (req, res) => {
  const { userId, items } = req.body; // items is [{ productId, quantity }]
  if (!userId || !items) {
    return res.status(400).json({ error: 'userId and items array are required.' });
  }

  try {
    // Delete existing cart items
    await prisma.cartItem.deleteMany({ where: { userId } });

    // Insert new cart items
    if (items.length > 0) {
      await prisma.cartItem.createMany({
        data: items.map(item => ({
          userId,
          productId: item.productId,
          quantity: item.quantity || 1
        }))
      });
    }

    res.json({ success: true, message: 'Cart synchronized successfully.' });
  } catch (error) {
    console.error('Error syncing cart:', error);
    res.status(500).json({ error: 'An error occurred while syncing cart.' });
  }
});

// Get user cart
router.get('/cart/:userId', async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.params.userId },
      include: {
        product: {
          include: {
            images: true,
            category: true,
            brand: true
          }
        }
      }
    });

    const formatted = items.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images[0]?.url || 'https://via.placeholder.com/150',
      category: item.product.category.name,
      brand: item.product.brand.name
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'An error occurred while fetching cart.' });
  }
});

// Toggle wishlist item
router.post('/wishlist', async (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ error: 'userId and productId are required.' });
  }

  try {
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (existing) {
      // Remove
      await prisma.wishlistItem.delete({
        where: {
          userId_productId: { userId, productId }
        }
      });
      return res.json({ success: true, wishlisted: false, message: 'Removed from wishlist.' });
    } else {
      // Add
      await prisma.wishlistItem.create({
        data: { userId, productId }
      });
      return res.json({ success: true, wishlisted: true, message: 'Added to wishlist.' });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ error: 'An error occurred while toggling wishlist.' });
  }
});

// Get user wishlist
router.get('/wishlist/:userId', async (req, res) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.params.userId },
      include: {
        product: {
          include: {
            images: true,
            category: true,
            brand: true
          }
        }
      }
    });

    const formatted = items.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      rating: item.product.rating,
      image: item.product.images[0]?.url || 'https://via.placeholder.com/150',
      category: item.product.category.name,
      brand: item.product.brand.name,
      description: item.product.description
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'An error occurred while fetching wishlist.' });
  }
});

module.exports = router;
