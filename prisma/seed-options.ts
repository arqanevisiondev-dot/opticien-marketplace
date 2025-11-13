import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedOptions() {
  console.log('🌱 Seeding product options...');

  const materials = [
    'Métal',
    'Plastique',
    'Titane',
    'Acétate',
    'Bois',
    'Aluminium',
    'Carbone',
  ];

  const genders = [
    'Homme',
    'Femme',
    'Unisexe',
    'Enfant',
  ];

  // Seed materials
  for (const material of materials) {
    await prisma.productOption.upsert({
      where: {
        type_value: {
          type: 'material',
          value: material,
        },
      },
      update: {},
      create: {
        type: 'material',
        value: material,
      },
    });
  }

  // Seed genders
  for (const gender of genders) {
    await prisma.productOption.upsert({
      where: {
        type_value: {
          type: 'gender',
          value: gender,
        },
      },
      update: {},
      create: {
        type: 'gender',
        value: gender,
      },
    });
  }

  console.log('✅ Product options seeded successfully');
  console.log(`   - ${materials.length} materials`);
  console.log(`   - ${genders.length} genders`);
}

seedOptions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
