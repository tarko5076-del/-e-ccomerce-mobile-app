const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyAdmin } = require('../middleware/adminAuth');

// Get all products with filters
router.get('/', async (req, res) => {
  const {
    search, category, brand, minPrice, maxPrice,
    processor, ram, storage, available, sortBy
  } = req.query;

  try {
    const where = {};

    // Search keyword
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { processor: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Category filter (name or ID)
    if (category && category !== 'All') {
      where.category = {
        name: { equals: category, mode: 'insensitive' }
      };
    }

    // Brand filter
    if (brand && brand !== 'All') {
      where.brand = {
        name: { equals: brand, mode: 'insensitive' }
      };
    }

    // Price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Spec filters
    if (processor) {
      where.processor = { contains: processor, mode: 'insensitive' };
    }
    if (ram) {
      where.ram = { contains: ram, mode: 'insensitive' };
    }
    if (storage) {
      where.storage = { contains: storage, mode: 'insensitive' };
    }

    // Availability
    if (available === 'true') {
      where.stock = { gt: 0 };
    }

    // Sorting
    let orderBy = { createdAt: 'desc' };
    if (sortBy) {
      if (sortBy === 'price_asc') orderBy = { price: 'asc' };
      else if (sortBy === 'price_desc') orderBy = { price: 'desc' };
      else if (sortBy === 'popularity') orderBy = { popularity: 'desc' };
      else if (sortBy === 'rating') orderBy = { rating: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        images: true,
        category: true,
        brand: true,
        reviews: true
      }
    });

    // Map to include a fallback direct image URL for frontend compatibility
    const formatted = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      rating: p.rating,
      stock: p.stock,
      warranty: p.warranty,
      popularity: p.popularity,
      processor: p.processor,
      ram: p.ram,
      storage: p.storage,
      battery: p.battery,
      displaySize: p.displaySize,
      camera: p.camera,
      os: p.os,
      categoryId: p.categoryId,
      category: p.category.name,
      brandId: p.brandId,
      brand: p.brand.name,
      image: p.images[0]?.url || 'https://via.placeholder.com/150',
      images: p.images.map(img => img.url),
      reviewCount: p.reviews.length
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'An error occurred while fetching products.' });
  }
});

// Get product categories and brands (for filter options in frontend)
router.get('/meta/filters', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ select: { name: true } });
    const brands = await prisma.brand.findMany({ select: { name: true } });
    
    res.json({
      categories: ['All', ...categories.map(c => c.name)],
      brands: ['All', ...brands.map(b => b.name)]
    });
  } catch (error) {
    console.error('Error fetching filter metadata:', error);
    res.status(500).json({ error: 'An error occurred while fetching filters.' });
  }
});

// Get product by id
router.get('/:id', async (req, res) => {
  try {
    const p = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        images: true,
        category: true,
        brand: true,
        reviews: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!p) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const formatted = {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      rating: p.rating,
      stock: p.stock,
      warranty: p.warranty,
      popularity: p.popularity,
      processor: p.processor,
      ram: p.ram,
      storage: p.storage,
      battery: p.battery,
      displaySize: p.displaySize,
      camera: p.camera,
      os: p.os,
      categoryId: p.categoryId,
      category: p.category.name,
      brandId: p.brandId,
      brand: p.brand.name,
      image: p.images[0]?.url || 'https://via.placeholder.com/150',
      images: p.images.map(img => img.url),
      reviews: p.reviews.map(r => ({
        id: r.id,
        userName: r.user.name,
        rating: r.rating,
        comment: r.comment,
        performance: r.performance,
        durability: r.durability,
        batteryLife: r.batteryLife,
        buildQuality: r.buildQuality,
        createdAt: r.createdAt.toISOString().split('T')[0]
      }))
    };

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'An error occurred while fetching product.' });
  }
});

// Get recommendations for a product
router.get('/:id/recommendations', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    let recommendedCategories = [product.category.name];
    if (product.category.name === 'Laptops' || product.category.name === 'Gaming Consoles') {
      recommendedCategories.push('Computer Accessories', 'Monitors', 'Headphones');
    } else if (product.category.name === 'Smartphones' || product.category.name === 'Tablets') {
      recommendedCategories.push('Headphones', 'Smartwatches');
    }

    const recommendations = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        category: {
          name: { in: recommendedCategories }
        }
      },
      take: 4,
      include: {
        images: true,
        category: true,
        brand: true
      }
    });

    const formatted = recommendations.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      rating: p.rating,
      stock: p.stock,
      processor: p.processor,
      ram: p.ram,
      storage: p.storage,
      categoryId: p.categoryId,
      category: p.category.name,
      brandId: p.brandId,
      brand: p.brand.name,
      image: p.images[0]?.url || 'https://via.placeholder.com/150',
      images: p.images.map(img => img.url)
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'An error occurred while fetching recommendations.' });
  }
});

// Add product (Admin)
router.post('/', verifyAdmin, async (req, res) => {
  const {
    name, description, price, stock, warranty, category, brand,
    processor, ram, storage, battery, displaySize, camera, os, image
  } = req.body;

  if (!name || !category || !brand || price === undefined) {
    return res.status(400).json({ error: 'Name, category, brand, and price are required.' });
  }

  try {
    // Find or create category
    let cat = await prisma.category.findUnique({ where: { name: category.trim() } });
    if (!cat) {
      cat = await prisma.category.create({
        data: { name: category.trim(), slug: category.trim().toLowerCase().replace(/ /g, '-') }
      });
    }

    // Find or create brand
    let br = await prisma.brand.findUnique({ where: { name: brand.trim() } });
    if (!br) {
      br = await prisma.brand.create({
        data: { name: brand.trim(), slug: brand.trim().toLowerCase().replace(/ /g, '-') }
      });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        price: parseFloat(price),
        stock: parseInt(stock) || 10,
        warranty: warranty?.trim() || 'No Warranty',
        processor: processor?.trim() || null,
        ram: ram?.trim() || null,
        storage: storage?.trim() || null,
        battery: battery?.trim() || null,
        displaySize: displaySize?.trim() || null,
        camera: camera?.trim() || null,
        os: os?.trim() || null,
        categoryId: cat.id,
        brandId: br.id,
      }
    });

    // Save primary image
    await prisma.productImage.create({
      data: {
        url: image?.trim() || 'https://via.placeholder.com/150',
        productId: product.id
      }
    });

    res.status(201).json({
      ...product,
      category: cat.name,
      brand: br.name,
      image: image || 'https://via.placeholder.com/150'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'An error occurred while creating product.' });
  }
});

// Update product (Admin)
router.put('/:id', verifyAdmin, async (req, res) => {
  const {
    name, description, price, stock, warranty, category, brand,
    processor, ram, storage, battery, displaySize, camera, os, image
  } = req.body;

  try {
    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (description !== undefined) dataToUpdate.description = description.trim();
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (stock !== undefined) dataToUpdate.stock = parseInt(stock);
    if (warranty !== undefined) dataToUpdate.warranty = warranty.trim();
    if (processor !== undefined) dataToUpdate.processor = processor.trim();
    if (ram !== undefined) dataToUpdate.ram = ram.trim();
    if (storage !== undefined) dataToUpdate.storage = storage.trim();
    if (battery !== undefined) dataToUpdate.battery = battery.trim();
    if (displaySize !== undefined) dataToUpdate.displaySize = displaySize.trim();
    if (camera !== undefined) dataToUpdate.camera = camera.trim();
    if (os !== undefined) dataToUpdate.os = os.trim();

    if (category) {
      let cat = await prisma.category.findUnique({ where: { name: category.trim() } });
      if (!cat) {
        cat = await prisma.category.create({
          data: { name: category.trim(), slug: category.trim().toLowerCase().replace(/ /g, '-') }
        });
      }
      dataToUpdate.categoryId = cat.id;
    }

    if (brand) {
      let br = await prisma.brand.findUnique({ where: { name: brand.trim() } });
      if (!br) {
        br = await prisma.brand.create({
          data: { name: brand.trim(), slug: brand.trim().toLowerCase().replace(/ /g, '-') }
        });
      }
      dataToUpdate.brandId = br.id;
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: dataToUpdate,
      include: { category: true, brand: true, images: true }
    });

    if (image) {
      // Overwrite primary image (first image)
      const primaryImg = product.images[0];
      if (primaryImg) {
        await prisma.productImage.update({
          where: { id: primaryImg.id },
          data: { url: image.trim() }
        });
      } else {
        await prisma.productImage.create({
          data: { url: image.trim(), productId: product.id }
        });
      }
    }

    res.json({
      ...product,
      category: product.category.name,
      brand: product.brand.name,
      image: image || product.images[0]?.url || 'https://via.placeholder.com/150'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'An error occurred while updating product.' });
  }
});

// Delete product
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'An error occurred while deleting product.' });
  }
});

module.exports = router;
