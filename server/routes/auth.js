const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'electrohub_jwt_secret_key_98765';

// User Registration
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        password: hashedPassword,
      },
      include: {
        addresses: true
      }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'An error occurred during registration.' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        addresses: true
      }
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

// Get user profile details
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        addresses: true
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'An error occurred while fetching profile.' });
  }
});

// Update user profile details
router.put('/profile/:id', async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (email !== undefined) dataToUpdate.email = email.toLowerCase().trim();
    if (phone !== undefined) dataToUpdate.phone = phone.trim();
    if (password !== undefined && password !== '') dataToUpdate.password = bcrypt.hashSync(password, 10);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: dataToUpdate,
      include: {
        addresses: true
      }
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'An error occurred while updating profile.' });
  }
});

// Add Address
router.post('/addresses', async (req, res) => {
  const { userId, fullName, street, subcity, city, phone, isDefault } = req.body;
  if (!userId || !fullName || !street || !subcity || !city || !phone) {
    return res.status(400).json({ error: 'Missing required address fields.' });
  }

  try {
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        fullName: fullName.trim(),
        street: street.trim(),
        subcity: subcity.trim(),
        city: city.trim(),
        phone: phone.trim(),
        isDefault: !!isDefault
      }
    });
    res.status(201).json(address);
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ error: 'An error occurred while adding address.' });
  }
});

// Get user addresses
router.get('/addresses/user/:userId', async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.params.userId },
      orderBy: { isDefault: 'desc' }
    });
    res.json(addresses);
  } catch (error) {
    console.error('Fetch addresses error:', error);
    res.status(500).json({ error: 'An error occurred while fetching addresses.' });
  }
});

// Delete Address
router.delete('/addresses/:id', async (req, res) => {
  try {
    await prisma.address.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Address deleted successfully.' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'An error occurred while deleting address.' });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  if (username.trim() === 'admin' && password.trim() === 'admin123') {
    const token = jwt.sign({ role: 'admin', username: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    return res.status(200).json({ success: true, token, role: 'admin' });
  }

  res.status(401).json({ error: 'Invalid admin credentials.' });
});

const { verifyAdmin } = require('../middleware/adminAuth');

// Get all users (Admin only)
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        orders: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formatted = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt.toISOString().split('T')[0],
      orderCount: u.orders.length
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'An error occurred while fetching users.' });
  }
});

module.exports = router;
