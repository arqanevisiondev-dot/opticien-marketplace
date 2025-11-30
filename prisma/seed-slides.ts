import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding slides...');

  // Clear existing slides
  await prisma.slide.deleteMany({});

  // Create demo slides
  await prisma.slide.createMany({
    data: [
      {
        title: 'Nouvelle Collection 2025',
        subtitle: 'Découvrez les dernières tendances en lunetterie',
        description: 'Des montures élégantes et modernes pour tous les styles',
        imageUrl: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=1200',
        type: 'PRODUCT',
        linkUrl: '/catalogue',
        linkText: 'Découvrir la collection',
        isActive: true,
        order: 0,
        backgroundColor: '#1b2632',
        textColor: '#ffffff',
        buttonColor: '#f56a24',
      },
      {
        title: 'Promotion Exceptionnelle',
        subtitle: '-30% sur toutes les montures',
        description: 'Offre valable jusqu\'au 31 décembre 2025',
        imageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=1200',
        type: 'PROMOTION',
        linkUrl: '/catalogue',
        linkText: 'Profiter de l\'offre',
        isActive: true,
        order: 1,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        backgroundColor: '#f56a24',
        textColor: '#ffffff',
        buttonColor: '#1b2632',
      },
      {
        title: 'Arqane Vision',
        subtitle: 'Votre partenaire de confiance',
        description: 'Plus de 500 opticiens partenaires à travers le Maroc',
        imageUrl: 'https://images.unsplash.com/photo-1606663889134-b1dedb5ed8b7?w=1200',
        type: 'ANNOUNCEMENT',
        linkUrl: '/opticiens',
        linkText: 'Trouver un opticien',
        isActive: true,
        order: 2,
        backgroundColor: '#2c3b4d',
        textColor: '#ffffff',
        buttonColor: '#f56a24',
      },
    ],
  });

  console.log('Slides seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
