const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add a product review
router.post('/', async (req, res) => {
  const {
    userId, productId, rating, comment,
    performance, durability, batteryLife, buildQuality
  } = req.body;

  if (!userId || !productId || rating === undefined) {
    return res.status(400).json({ error: 'userId, productId and rating are required.' });
  }

  try {
    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { userId, productId }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product.' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating: parseFloat(rating),
        comment: comment?.trim() || '',
        performance: performance ? parseFloat(performance) : null,
        durability: durability ? parseFloat(durability) : null,
        batteryLife: batteryLife ? parseFloat(batteryLife) : null,
        buildQuality: buildQuality ? parseFloat(buildQuality) : null
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    // Update product overall rating average
    const allReviews = await prisma.review.findMany({
      where: { productId }
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: { rating: parseFloat(avgRating.toFixed(1)) }
    });

    res.status(201).json({
      id: review.id,
      userName: review.user.name,
      rating: review.rating,
      comment: review.comment,
      performance: review.performance,
      durability: review.durability,
      batteryLife: review.batteryLife,
      buildQuality: review.buildQuality,
      createdAt: review.createdAt.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'An error occurred while submitting review.' });
  }
});

// Fetch reviews for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = reviews.map(r => ({
      id: r.id,
      userName: r.user.name,
      rating: r.rating,
      comment: r.comment,
      performance: r.performance,
      durability: r.durability,
      batteryLife: r.batteryLife,
      buildQuality: r.buildQuality,
      createdAt: r.createdAt.toISOString().split('T')[0]
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({ error: 'An error occurred while fetching reviews.' });
  }
});

module.exports = router;
