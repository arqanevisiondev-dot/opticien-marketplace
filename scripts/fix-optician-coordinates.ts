import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Manually set coordinates for specific optician
// Use this when you have exact coordinates from Google Maps Plus Code

async function updateOpticianCoordinates() {
  // X7Q6+29 Sala Al Jadida decodes to:
  // Latitude: 33.5900889
  // Longitude: -7.5897222
  
  const opticianBusinessName = 'mou';
  
  // Coordinates from Plus Code X7Q6+29 (Sala Al Jadida, not Salé!)
  const latitude = 33.5900889;
  const longitude = -7.5897222;
  
  console.log(`Updating ${opticianBusinessName} with coordinates:`);
  console.log(`Latitude: ${latitude}`);
  console.log(`Longitude: ${longitude}\n`);
  
  const updated = await prisma.optician.updateMany({
    where: {
      businessName: opticianBusinessName
    },
    data: {
      latitude,
      longitude,
      city: 'Sala Al Jadida' // Also fix the city name
    }
  });
  
  console.log(`✅ Updated ${updated.count} optician(s)`);
  
  // Verify
  const optician = await prisma.optician.findFirst({
    where: { businessName: opticianBusinessName },
    select: {
      businessName: true,
      city: true,
      address: true,
      latitude: true,
      longitude: true
    }
  });
  
  console.log('\nCurrent data:');
  console.log(optician);
}

updateOpticianCoordinates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
