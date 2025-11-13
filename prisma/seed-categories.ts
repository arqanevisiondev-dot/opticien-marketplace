import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategories() {
  console.log('🌱 Seeding categories...');

  const categories = [
    {
      name: 'Montures de vue',
      slug: 'montures-de-vue',
      description: 'Montures pour verres correcteurs',
    },
    {
      name: 'Lunettes de soleil',
      slug: 'lunettes-de-soleil',
      description: 'Montures avec protection UV',
    },
    {
      name: 'Montures sport',
      slug: 'montures-sport',
      description: 'Montures adaptées aux activités sportives',
    },
    {
      name: 'Montures enfant',
      slug: 'montures-enfant',
      description: 'Montures spécialement conçues pour les enfants',
    },
    {
      name: 'Montures premium',
      slug: 'montures-premium',
      description: 'Collection haut de gamme',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categories seeded successfully');
}

seedCategories()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
