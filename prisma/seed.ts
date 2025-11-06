import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@optimarket.com' },
    update: {},
    create: {
      email: 'admin@optimarket.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created');

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { email: 'contact@luxottica.com' },
      update: {},
      create: {
        name: 'Luxottica',
        email: 'contact@luxottica.com',
        phone: '+33 1 23 45 67 89',
        whatsapp: '+33623456789',
        description: 'Leader mondial de la lunetterie de luxe',
      },
    }),
    prisma.supplier.upsert({
      where: { email: 'info@safilo.com' },
      update: {},
      create: {
        name: 'Safilo Group',
        email: 'info@safilo.com',
        phone: '+33 1 98 76 54 32',
        whatsapp: '+33698765432',
        description: 'Fabricant italien de montures de qualité',
      },
    }),
  ]);
  console.log('✅ Suppliers created');

  // Create products
  const products = [
    {
      name: 'Aviator Classic',
      reference: 'AV-001',
      description: 'Monture aviateur classique en métal doré',
      material: 'Métal',
      gender: 'Unisexe',
      shape: 'Aviateur',
      color: 'Or',
      price: 89.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
      ]),
      supplierId: suppliers[0].id,
    },
    {
      name: 'Wayfarer Modern',
      reference: 'WF-002',
      description: 'Monture wayfarer moderne en acétate noir',
      material: 'Acétate',
      gender: 'Unisexe',
      shape: 'Wayfarer',
      color: 'Noir',
      price: 79.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400',
      ]),
      supplierId: suppliers[0].id,
    },
    {
      name: 'Round Vintage',
      reference: 'RV-003',
      description: 'Monture ronde vintage en métal argenté',
      material: 'Métal',
      gender: 'Unisexe',
      shape: 'Ronde',
      color: 'Argent',
      price: 69.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400',
      ]),
      supplierId: suppliers[1].id,
    },
    {
      name: 'Cat Eye Elegance',
      reference: 'CE-004',
      description: 'Monture cat eye élégante pour femme',
      material: 'Acétate',
      gender: 'Femme',
      shape: 'Cat Eye',
      color: 'Écaille',
      price: 94.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1577803645773-f96470509666?w=400',
      ]),
      supplierId: suppliers[1].id,
    },
    {
      name: 'Sport Pro',
      reference: 'SP-005',
      description: 'Monture sportive légère en titane',
      material: 'Titane',
      gender: 'Homme',
      shape: 'Sport',
      color: 'Noir mat',
      price: 129.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=400',
      ]),
      supplierId: suppliers[0].id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { reference: product.reference },
      update: {},
      create: product,
    });
  }
  console.log('✅ Products created');

  // Create sample opticians
  const opticianPassword = await bcrypt.hash('optician123', 10);
  
  const optician1 = await prisma.user.upsert({
    where: { email: 'optique.paris@example.com' },
    update: {},
    create: {
      email: 'optique.paris@example.com',
      password: opticianPassword,
      role: 'OPTICIAN',
      optician: {
        create: {
          businessName: 'Optique de Paris',
          firstName: 'Jean',
          lastName: 'Dupont',
          phone: '+33 1 42 56 78 90',
          whatsapp: '+33642567890',
          address: '123 Avenue des Champs-Élysées',
          city: 'Paris',
          postalCode: '75008',
          latitude: 48.8698,
          longitude: 2.3078,
          status: 'APPROVED',
        },
      },
    },
  });

  const optician2 = await prisma.user.upsert({
    where: { email: 'vision.lyon@example.com' },
    update: {},
    create: {
      email: 'vision.lyon@example.com',
      password: opticianPassword,
      role: 'OPTICIAN',
      optician: {
        create: {
          businessName: 'Vision Lyon',
          firstName: 'Marie',
          lastName: 'Martin',
          phone: '+33 4 78 90 12 34',
          whatsapp: '+33678901234',
          address: '45 Rue de la République',
          city: 'Lyon',
          postalCode: '69002',
          latitude: 45.7640,
          longitude: 4.8357,
          status: 'APPROVED',
        },
      },
    },
  });

  const optician3 = await prisma.user.upsert({
    where: { email: 'optique.marseille@example.com' },
    update: {},
    create: {
      email: 'optique.marseille@example.com',
      password: opticianPassword,
      role: 'OPTICIAN',
      optician: {
        create: {
          businessName: 'Optique Marseille',
          firstName: 'Pierre',
          lastName: 'Bernard',
          phone: '+33 4 91 23 45 67',
          whatsapp: '+33691234567',
          address: '78 La Canebière',
          city: 'Marseille',
          postalCode: '13001',
          latitude: 43.2965,
          longitude: 5.3698,
          status: 'PENDING',
        },
      },
    },
  });

  console.log('✅ Opticians created');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📝 Test credentials:');
  console.log('Admin: admin@optimarket.com / admin123');
  console.log('Optician: optique.paris@example.com / optician123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
