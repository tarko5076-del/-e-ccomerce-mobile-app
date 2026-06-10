const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database entries...');
  // Delete in reverse order of foreign keys
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding categories...');
  const categoryNames = [
    'Smartphones', 'Laptops', 'Tablets', 'Gaming Consoles', 'Smartwatches',
    'Headphones', 'Computer Accessories', 'Monitors', 'Televisions', 'Cameras',
    'Smart Home Devices'
  ];
  const categories = {};
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/ /g, '-');
    categories[name] = await prisma.category.create({
      data: { name, slug }
    });
  }

  console.log('Seeding brands...');
  const brandNames = [
    'Apple', 'Samsung', 'Dell', 'Sony', 'Canon', 'Logitech', 'Keychron',
    'LG', 'Microsoft', 'Google', 'Amazon', 'Nintendo', 'HP'
  ];
  const brands = {};
  for (const name of brandNames) {
    const slug = name.toLowerCase().replace(/ /g, '-');
    brands[name] = await prisma.brand.create({
      data: { name, slug }
    });
  }

  console.log('Seeding users...');
  const hashedUserPass = bcrypt.hashSync('password123', 10);
  const testUser = await prisma.user.create({
    data: {
      name: 'Aisha Mohammed',
      email: 'aisha@example.com',
      phone: '+251911223344',
      password: hashedUserPass,
    }
  });

  const testUser2 = await prisma.user.create({
    data: {
      name: 'Dawit Bekele',
      email: 'dawit@example.com',
      phone: '+251922334455',
      password: hashedUserPass,
    }
  });

  console.log('Seeding addresses...');
  const aishaAddress1 = await prisma.address.create({
    data: {
      userId: testUser.id,
      fullName: 'Aisha Mohammed',
      street: 'Bole Road, Building 10, Apt 4',
      subcity: 'Bole',
      city: 'Addis Ababa',
      phone: '+251911223344',
      isDefault: true
    }
  });

  const dawitAddress = await prisma.address.create({
    data: {
      userId: testUser2.id,
      fullName: 'Dawit Bekele',
      street: 'Kazanchis Main St',
      subcity: 'Kirkos',
      city: 'Addis Ababa',
      phone: '+251922334455',
      isDefault: true
    }
  });

  console.log('Seeding products...');
  const PRODUCTS_DATA = [
    {
      name: 'iPhone 15 Pro',
      category: 'Smartphones',
      brand: 'Apple',
      price: 999,
      rating: 4.8,
      stock: 15,
      warranty: '1 Year Apple Warranty',
      popularity: 95,
      description: 'Experience the titanium design, A17 Pro chip, and a customizable Action button. Industry leading triple camera system with 48MP main sensor.',
      processor: 'A17 Pro',
      ram: '8GB',
      storage: '128GB',
      battery: '3274 mAh',
      displaySize: '6.1 inches OLED',
      camera: '48MP + 12MP + 12MP',
      os: 'iOS 17',
      image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&q=80',
      extraImages: [
        'https://images.unsplash.com/photo-1565849906660-bf47ef5c85b1?w=400&q=80',
        'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=400&q=80'
      ]
    },
    {
      name: 'Samsung Galaxy S24',
      category: 'Smartphones',
      brand: 'Samsung',
      price: 849,
      rating: 4.6,
      stock: 20,
      warranty: '2 Years Samsung Warranty',
      popularity: 88,
      description: 'Epic, just like that. Explore Galaxy AI features, advanced low-light photography, and super bright screen dynamic AMOLED display.',
      processor: 'Snapdragon 8 Gen 3',
      ram: '8GB',
      storage: '256GB',
      battery: '4000 mAh',
      displaySize: '6.2 inches AMOLED',
      camera: '50MP + 10MP + 12MP',
      os: 'Android 14',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80',
      extraImages: []
    },
    {
      name: 'MacBook Air M3',
      category: 'Laptops',
      brand: 'Apple',
      price: 1299,
      rating: 4.9,
      stock: 8,
      warranty: '1 Year Apple Warranty',
      popularity: 98,
      description: 'Supercharged by Apple M3 chip. Offers up to 18 hours of battery life, striking Liquid Retina display, and an ultra-thin silent aluminum enclosure.',
      processor: 'Apple M3',
      ram: '8GB Unified',
      storage: '256GB SSD',
      battery: '18 Hours',
      displaySize: '13.6 inches Retina',
      camera: '1080p FaceTime HD',
      os: 'macOS Sonoma',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
      extraImages: []
    },
    {
      name: 'Dell XPS 15',
      category: 'Laptops',
      brand: 'Dell',
      price: 1099,
      rating: 4.5,
      stock: 12,
      warranty: '1 Year Dell Onsite Warranty',
      popularity: 82,
      description: 'Stunning 16:10 display, powerful Intel Core i7 processor, and premium carbon fiber deck styling with Nvidia graphics.',
      processor: 'Intel Core i7-13700H',
      ram: '16GB DDR5',
      storage: '512GB NVMe SSD',
      battery: '86 Whr',
      displaySize: '15.6 inches FHD+',
      camera: '720p HD Camera',
      os: 'Windows 11 Home',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80',
      extraImages: []
    },
    {
      name: 'iPad Pro M4',
      category: 'Tablets',
      brand: 'Apple',
      price: 999,
      rating: 4.8,
      stock: 14,
      warranty: '1 Year Apple Warranty',
      popularity: 90,
      description: 'Thinnest Apple product ever with the groundbreaking Tandem OLED Ultra Retina XDR display, powered by Apple M4 chip.',
      processor: 'Apple M4',
      ram: '8GB',
      storage: '256GB',
      battery: '10 Hours',
      displaySize: '11 inches OLED',
      camera: '12MP Wide + LiDAR',
      os: 'iPadOS 17',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80',
      extraImages: []
    },
    {
      name: 'PlayStation 5',
      category: 'Gaming Consoles',
      brand: 'Sony',
      price: 499,
      rating: 4.8,
      stock: 18,
      warranty: '1 Year Sony Warranty',
      popularity: 97,
      description: 'Experience lightning fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback and 3D Audio.',
      processor: 'Custom AMD Zen 2',
      ram: '16GB GDDR6',
      storage: '825GB Custom SSD',
      battery: 'N/A',
      displaySize: 'N/A',
      camera: 'N/A',
      os: 'PlayStation System Software',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&q=80',
      extraImages: []
    },
    {
      name: 'Sony WH-1000XM5',
      category: 'Headphones',
      brand: 'Sony',
      price: 349,
      rating: 4.7,
      stock: 22,
      warranty: '1 Year Sony Warranty',
      popularity: 92,
      description: 'Industry leading active noise cancellation. Enjoy crystal clear hands-free calling, up to 30 hours battery life, and premium design comfort.',
      processor: 'V1 / QN1 processors',
      ram: 'N/A',
      storage: 'N/A',
      battery: '30 Hours',
      displaySize: 'N/A',
      camera: 'N/A',
      os: 'Proprietary firmware',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
      extraImages: []
    },
    {
      name: 'AirPods Pro 2',
      category: 'Headphones',
      brand: 'Apple',
      price: 249,
      rating: 4.6,
      stock: 25,
      warranty: '1 Year Apple Warranty',
      popularity: 89,
      description: 'Features 2x more Active Noise Cancellation, plus Adaptive Audio and Personalized Spatial Audio for immersive acoustics.',
      processor: 'Apple H2 chip',
      ram: 'N/A',
      storage: 'N/A',
      battery: '6 Hours (30h with case)',
      displaySize: 'N/A',
      camera: 'N/A',
      os: 'Apple AirPods Firmware',
      image: 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=400&q=80',
      extraImages: []
    },
    {
      name: 'Canon EOS R50',
      category: 'Cameras',
      brand: 'Canon',
      price: 679,
      rating: 4.4,
      stock: 6,
      warranty: '1 Year Canon Warranty',
      popularity: 76,
      description: 'The ideal entry point for content creators. Compact, lightweight mirrorless camera with 24.2 Megapixel CMOS sensor and dual pixel autofocus.',
      processor: 'DIGIC X',
      ram: 'N/A',
      storage: 'N/A',
      battery: 'LP-E17 rechargeable',
      displaySize: '3 inches Touchscreen LCD',
      camera: '24.2 MP APS-C Sensor',
      os: 'Canon OS',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
      extraImages: []
    },
    {
      name: 'LG C3 OLED 65"',
      category: 'Televisions',
      brand: 'LG',
      price: 1599,
      rating: 4.9,
      stock: 5,
      warranty: '2 Years LG Warranty',
      popularity: 94,
      description: 'The OLED EVO C3 is loaded with details and features, including self-lit pixels, a9 AI Processor Gen6, and custom gaming interfaces.',
      processor: 'a9 AI Processor Gen6',
      ram: 'N/A',
      storage: 'N/A',
      battery: 'N/A',
      displaySize: '65 inches OLED',
      camera: 'N/A',
      os: 'webOS 23',
      image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&q=80',
      extraImages: []
    },
    {
      name: 'Logitech MX Master 3S',
      category: 'Computer Accessories',
      brand: 'Logitech',
      price: 99,
      rating: 4.7,
      stock: 35,
      warranty: '1 Year Logitech Warranty',
      popularity: 91,
      description: 'An iconic mouse remastered. Feel every moment of your workflow with tactile quiet clicks, 8k DPI tracking, and MagSpeed scrolling.',
      processor: 'N/A',
      ram: 'N/A',
      storage: 'N/A',
      battery: '70 Days rechargeable',
      displaySize: 'N/A',
      camera: 'N/A',
      os: 'Windows/macOS compatible',
      image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&q=80',
      extraImages: []
    }
  ];

  const dbProducts = [];
  for (const prod of PRODUCTS_DATA) {
    const category = categories[prod.category];
    const brand = brands[prod.brand];
    if (!category || !brand) {
      console.error(`Skipping product ${prod.name} due to missing category/brand relation`);
      continue;
    }

    const createdProd = await prisma.product.create({
      data: {
        name: prod.name,
        price: prod.price * 55, // Seed in ETB directly
        rating: prod.rating,
        stock: prod.stock,
        warranty: prod.warranty,
        popularity: prod.popularity,
        description: prod.description,
        processor: prod.processor,
        ram: prod.ram,
        storage: prod.storage,
        battery: prod.battery,
        displaySize: prod.displaySize,
        camera: prod.camera,
        os: prod.os,
        categoryId: category.id,
        brandId: brand.id
      }
    });

    dbProducts.push(createdProd);

    // Save primary image
    await prisma.productImage.create({
      data: {
        url: prod.image,
        productId: createdProd.id
      }
    });

    // Save extra images
    for (const url of prod.extraImages) {
      await prisma.productImage.create({
        data: {
          url,
          productId: createdProd.id
        }
      });
    }
  }

  console.log('Seeding reviews...');
  for (const product of dbProducts) {
    // Review 1 by Aisha
    await prisma.review.create({
      data: {
        userId: testUser.id,
        productId: product.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
        comment: `Absolutely love this ${product.name}! Quality is superb. Highly recommend it.`,
        performance: 4.8,
        durability: 4.5,
        batteryLife: 4.6,
        buildQuality: 4.9
      }
    });

    // Review 2 by Dawit
    await prisma.review.create({
      data: {
        userId: testUser2.id,
        productId: product.id,
        rating: Math.floor(Math.random() * 2) + 3, // 3 or 4
        comment: `Good performance for the price. The ${product.name} functions as advertised.`,
        performance: 4.2,
        durability: 4.0,
        batteryLife: 3.8,
        buildQuality: 4.3
      }
    });
  }

  console.log('Seeding mock orders...');
  // Order 1: Aisha (Paid)
  const order1 = await prisma.order.create({
    data: {
      userId: testUser.id,
      customerName: 'Aisha Mohammed',
      customerEmail: 'aisha@example.com',
      customerPhone: '+251911223344',
      total: 1248 * 55, // Seed in ETB
      status: 'paid',
      address: 'Bole Road, Building 10, Apt 4, Bole, Addis Ababa',
      method: 'Chapa (Card)',
    }
  });

  // Order Items
  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: dbProducts.find(p => p.name === 'iPhone 15 Pro').id,
      quantity: 1,
      price: 999 * 55 // Seed in ETB
    }
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: dbProducts.find(p => p.name === 'AirPods Pro 2').id,
      quantity: 1,
      price: 249 * 55 // Seed in ETB
    }
  });

  // Payment record for Order 1
  await prisma.payment.create({
    data: {
      orderId: order1.id,
      transactionId: 'TX-ELECTRO-' + Math.floor(100000 + Math.random() * 900000),
      amount: 1248 * 55, // Seed in ETB
      status: 'success',
      method: 'Chapa',
      rawResponse: JSON.stringify({ message: 'Success', status: 'completed' })
    }
  });

  // Order 2: Dawit (Shipped)
  const order2 = await prisma.order.create({
    data: {
      userId: testUser2.id,
      customerName: 'Dawit Bekele',
      customerEmail: 'dawit@example.com',
      customerPhone: '+251922334455',
      total: 349 * 55, // Seed in ETB
      status: 'shipped',
      address: 'Kazanchis Main St, Kirkos, Addis Ababa',
      method: 'CBE Birr',
    }
  });

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: dbProducts.find(p => p.name === 'Sony WH-1000XM5').id,
      quantity: 1,
      price: 349 * 55 // Seed in ETB
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
