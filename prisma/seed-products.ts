import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding products...');

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    console.error('❌ Admin user not found. Please run main seed first.');
    return;
  }

  // Get or create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'lunettes-de-vue' },
      update: {},
      create: {
        name: 'Lunettes de vue',
        slug: 'lunettes-de-vue',
        description: 'Collection de lunettes de vue pour tous les styles',
      }
    }),
    prisma.category.upsert({
      where: { slug: 'lunettes-de-soleil' },
      update: {},
      create: {
        name: 'Lunettes de soleil',
        slug: 'lunettes-de-soleil',
        description: 'Protection UV et style pour vos journées ensoleillées',
      }
    }),
    prisma.category.upsert({
      where: { slug: 'lunettes-sport' },
      update: {},
      create: {
        name: 'Lunettes sport',
        slug: 'lunettes-sport',
        description: 'Lunettes techniques pour vos activités sportives',
      }
    }),
  ]);

  const [categoryVue, categorySoleil, categorySport] = categories;
  console.log('✅ Categories created');

  // Products data
  const products = [
    // Lunettes de vue
    {
      name: 'Aviator Classic',
      slug: 'aviator-classic',
      reference: 'AV-001',
      description: 'Monture aviateur classique en métal doré avec verres anti-reflet. Design intemporel qui convient à toutes les formes de visage.',
      material: 'Métal',
      gender: 'Unisexe',
      marque: 'Arqane Vision',
      shape: 'Aviateur',
      color: 'Or',
      price: 89.99,
      salePrice: 79.99,
      firstOrderRemisePct: 10,
      loyaltyPointsReward: 90,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
        'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
      ]),
      inStock: true,
      isNewCollection: true,
      categoryId: categoryVue.id,
      userId: admin.id,
    },
    {
      name: 'Wayfarer Modern',
      slug: 'wayfarer-modern',
      reference: 'WF-002',
      description: 'Monture wayfarer moderne en acétate noir. Style iconique et confortable pour un usage quotidien.',
      material: 'Acétate',
      gender: 'Unisexe',
      marque: 'Arqane Vision',
      shape: 'Wayfarer',
      color: 'Noir',
      price: 79.99,
      firstOrderRemisePct: 10,
      loyaltyPointsReward: 80,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
      ]),
      inStock: true,
      isNewCollection: true,
      categoryId: categoryVue.id,
      userId: admin.id,
    },
    {
      name: 'Round Vintage',
      slug: 'round-vintage',
      reference: 'RV-003',
      description: 'Monture ronde vintage en métal argenté. Inspirée des années 70, parfaite pour un look rétro.',
      material: 'Métal',
      gender: 'Unisexe',
      marque: 'Arqane Vision',
      shape: 'Ronde',
      color: 'Argent',
      price: 69.99,
      salePrice: 59.99,
      firstOrderRemisePct: 15,
      loyaltyPointsReward: 70,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800',
      ]),
      inStock: true,
      categoryId: categoryVue.id,
      userId: admin.id,
    },
    {
      name: 'Cat Eye Elegance',
      slug: 'cat-eye-elegance',
      reference: 'CE-004',
      description: 'Monture cat eye élégante pour femme en acétate écaille. Féminité et sophistication au rendez-vous.',
      material: 'Acétate',
      gender: 'Femme',
      marque: 'Arqane Vision',
      shape: 'Cat Eye',
      color: 'Écaille',
      price: 94.99,
      firstOrderRemisePct: 10,
      loyaltyPointsReward: 95,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800',
      ]),
      inStock: true,
      isNewCollection: true,
      categoryId: categoryVue.id,
      userId: admin.id,
    },
    {
      name: 'Rectangle Business',
      slug: 'rectangle-business',
      reference: 'RB-005',
      description: 'Monture rectangulaire professionnelle en titane noir. Légère et résistante pour un usage intensif.',
      material: 'Titane',
      gender: 'Homme',
      marque: 'Arqane Vision',
      shape: 'Rectangle',
      color: 'Noir',
      price: 119.99,
      firstOrderRemisePct: 10,
      loyaltyPointsReward: 120,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800',
      ]),
      inStock: true,
      categoryId: categoryVue.id,
      userId: admin.id,
    },

    // Lunettes de soleil
    {
      name: 'Pilot Sun',
      slug: 'pilot-sun',
      reference: 'PS-101',
      description: 'Lunettes de soleil aviateur avec protection UV400. Verres polarisés pour une vision optimale.',
      material: 'Métal',
      gender: 'Unisexe',
      marque: 'Arqane Vision',
      shape: 'Aviateur',
      color: 'Argent',
      price: 129.99,
      salePrice: 109.99,
      firstOrderRemisePct: 15,
      loyaltyPointsReward: 130,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
      ]),
      inStock: true,
      isNewCollection: true,
      categoryId: categorySoleil.id,
      userId: admin.id,
    },
    {
      name: 'Gradient Style',
      slug: 'gradient-style',
      reference: 'GS-102',
      description: 'Lunettes de soleil oversize avec verres dégradés. Protection et style pour l\'été.',
      material: 'Acétate',
      gender: 'Femme',
      marque: 'Arqane Vision',
      shape: 'Oversize',
      color: 'Marron',
      price: 99.99,
      firstOrderRemisePct: 10,
      loyaltyPointsReward: 100,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800',
      ]),
      inStock: true,
      categoryId: categorySoleil.id,
      userId: admin.id,
    },
    {
      name: 'Sport Sun Pro',
      slug: 'sport-sun-pro',
      reference: 'SSP-103',
      description: 'Lunettes de soleil sport avec verres miroir. Légères et couvrantes pour vos activités outdoor.',
      material: 'Polycarbonate',
      gender: 'Unisexe',
      marque: 'Arqane Vision',
      shape: 'Sport',
      color: 'Noir/Rouge',
      price: 149.99,
      firstOrderRemisePct: 10,
      loyaltyPointsReward: 150,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800',
      ]),
      inStock: true,
      isNewCollection: true,
      categoryId: categorySoleil.id,
      userId: admin.id,
    },
    {
      name: 'Retro Square',
      slug: 'retro-square',
      reference: 'RS-104',
      description: 'Lunettes de soleil carrées rétro en acétate. Design années 80 revisité.',
      material: 'Acétate',
      gender: 'Unisexe',
      marque: 'Arqane Vision',
      shape: 'Carré',
      color: 'Écaille',
      price: 89.99,
      salePrice: 74.99,
      firstOrderRemisePct: 15,
      loyaltyPointsReward: 90,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
      ]),
      inStock: true,
      categoryId: categorySoleil.id,
      userId: admin.id,
    },

    // Lunettes sport
    {
      name: 'Cycliste Pro',
      slug: 'cycliste-pro',
      reference: 'CP-201',
      description: 'Lunettes de cyclisme avec verres photochromiques. S\'adaptent à toutes les conditions lumineuses.',
      material: 'Grilamid TR90',
      gender: 'Unisexe',
      marque: 'Arqane Vision',
      shape: 'Sport',
      color: 'Noir/Bleu',
      price: 179.99,
      firstOrderRemisePct: 10,
      loyaltyPointsReward: 180,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800',
      ]),
      inStock: true,
      isNewCollection: true,
      categoryId: categorySport.id,
      userId: admin.id,
    },
    {
      name: 'Running Vision',
      slug: 'running-vision',
      reference: 'RV-202',
      description: 'Lunettes de running ultra-légères avec grip anti-dérapant. Parfaites pour vos courses.',
      material: 'Polycarbonate',
      gender: 'Unisexe',
      marque: 'Arqane Vision',
      shape: 'Sport',
      color: 'Orange',
      price: 139.99,
      salePrice: 119.99,
      firstOrderRemisePct: 10,
      loyaltyPointsReward: 140,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800',
      ]),
      inStock: true,
      categoryId: categorySport.id,
      userId: admin.id,
    },
    {
      name: 'Ski Alpine',
      slug: 'ski-alpine',
      reference: 'SA-203',
      description: 'Masque de ski avec double écran anti-buée. Protection optimale en montagne.',
      material: 'TPU',
      gender: 'Unisexe',
      marque: 'Arqane Vision',
      shape: 'Masque',
      color: 'Blanc',
      price: 199.99,
      firstOrderRemisePct: 10,
      loyaltyPointsReward: 200,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
      ]),
      inStock: true,
      categoryId: categorySport.id,
      userId: admin.id,
    },
  ];

  // Create products
  for (const product of products) {
    await prisma.product.upsert({
      where: { reference: product.reference },
      update: product,
      create: product,
    });
  }

  console.log(`✅ Created ${products.length} products`);
  console.log('🎉 Product seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
