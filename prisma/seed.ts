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

  // Create default supplier (OptiMarket Admin)
  const adminSupplier = await prisma.supplier.upsert({
    where: { email: 'admin@optimarket.com' },
    update: {},
    create: {
      name: 'OptiMarket',
      email: 'admin@optimarket.com',
      phone: '+33 1 23 45 67 89',
      whatsapp: '+33612345678',
      description: 'Plateforme OptiMarket - Fournisseur principal',
      address: '10 Rue de Rivoli',
      city: 'Paris',
      postalCode: '75001',
      latitude: 48.8566,
      longitude: 2.3522,
    },
  });
  console.log('✅ Default supplier created');

  // Create products
  const products = [
    {
      name: 'Aviator Classic',
      slug: 'aviator-classic',
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
      supplierId: adminSupplier.id,
    },
    {
      name: 'Wayfarer Modern',
      slug: 'wayfarer-modern',
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
      supplierId: adminSupplier.id,
    },
    {
      name: 'Round Vintage',
      slug: 'round-vintage',
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
      supplierId: adminSupplier.id,
    },
    {
      name: 'Cat Eye Elegance',
      slug: 'cat-eye-elegance',
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
      supplierId: adminSupplier.id,
    },
    {
      name: 'Sport Pro',
      slug: 'sport-pro',
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
      supplierId: adminSupplier.id,
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

  const saleOpt1 = await prisma.user.upsert({
    where: { email: 'alami.optic.sale@example.com' },
    update: {},
    create: {
      email: 'alami.optic.sale@example.com',
      password: opticianPassword,
      role: 'OPTICIAN',
      optician: {
        create: {
          businessName: 'Alami Optic',
          firstName: 'Ahmed',
          lastName: 'Alami',
          phone: '+212 537 123 456',
          whatsapp: '+212612345678',
          address: '4 Boulevard Lalla Asmaa, Résidence My Youssef, Mag 5, Tabriquet',
          city: 'Salé',
          postalCode: '11000',
          latitude: 34.0452,
          longitude: -6.8106,
          status: 'APPROVED',
        },
      },
    },
  });

  const saleOpt2 = await prisma.user.upsert({
    where: { email: 'chemaou.optic.sale@example.com' },
    update: {},
    create: {
      email: 'chemaou.optic.sale@example.com',
      password: opticianPassword,
      role: 'OPTICIAN',
      optician: {
        create: {
          businessName: 'Chemaou Optic',
          firstName: 'Khalid',
          lastName: 'Chemaou',
          phone: '+212 537 654 321',
          whatsapp: '+212611223344',
          address: '61 Boulevard Ahmed Balafrej, Hay Nahda, Route de Kénitra',
          city: 'Salé',
          postalCode: '11000',
          latitude: 34.064,
          longitude: -6.8055,
          status: 'APPROVED',
        },
      },
    },
  });

  const saleOpt3 = await prisma.user.upsert({
    where: { email: 'espace.visuel.sale@example.com' },
    update: {},
    create: {
      email: 'espace.visuel.sale@example.com',
      password: opticianPassword,
      role: 'OPTICIAN',
      optician: {
        create: {
          businessName: 'Espace Visuel',
          firstName: 'Nadia',
          lastName: 'El Fassi',
          phone: '+212 537 777 888',
          whatsapp: '+212600112233',
          address: '43B Boulevard Mohammed V, C.5, Sala Al Jadida',
          city: 'Salé',
          postalCode: '11015',
          latitude: 34.062,
          longitude: -6.7754,
          status: 'APPROVED',
        },
      },
    },
  });

  const saleOpt4 = await prisma.user.upsert({
    where: { email: 'audio.optique.sale@example.com' },
    update: {},
    create: {
      email: 'audio.optique.sale@example.com',
      password: opticianPassword,
      role: 'OPTICIAN',
      optician: {
        create: {
          businessName: 'Audio Optique Salé',
          firstName: 'Youssef',
          lastName: 'Zenfari',
          phone: '+212 537 888 999',
          whatsapp: '+212601223344',
          address: 'Boulevard Hassan II, Lotissement Zenfari N°5, Bettana',
          city: 'Salé',
          postalCode: '11020',
          latitude: 34.0582,
          longitude: -6.8199,
          status: 'APPROVED',
        },
      },
    },
  });

  const saleOpt5 = await prisma.user.upsert({
    where: { email: 'belle.optique.sale@example.com' },
    update: {},
    create: {
      email: 'belle.optique.sale@example.com',
      password: opticianPassword,
      role: 'OPTICIAN',
      optician: {
        create: {
          businessName: 'Belle Optique',
          firstName: 'Bouchra',
          lastName: 'Ouazzani',
          phone: '+212 537 222 333',
          whatsapp: '+212602334455',
          address: '1361 Rue Fkih Ben Salah, angle Boulevard Ibn Al Haytam, Mag. 2',
          city: 'Salé',
          postalCode: '11010',
          latitude: 34.05,
          longitude: -6.8,
          status: 'APPROVED',
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
