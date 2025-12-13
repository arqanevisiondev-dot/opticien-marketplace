import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const opticians = await prisma.optician.findMany({
    select: {
      id: true,
      businessName: true,
      city: true,
      latitude: true,
      longitude: true,
    }
  });

  console.log('📍 Opticians and their coordinates:\n');
  opticians.forEach(opt => {
    const hasCoords = opt.latitude !== null && opt.longitude !== null;
    const icon = hasCoords ? '✅' : '❌';
    console.log(`${icon} ${opt.businessName} (${opt.city})`);
    if (hasCoords) {
      console.log(`   Coordinates: ${opt.latitude}, ${opt.longitude}`);
    } else {
      console.log(`   No coordinates`);
    }
    console.log();
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
