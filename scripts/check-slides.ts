import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking slides in database...\n');
    
    const slides = await prisma.slide.findMany();
    
    console.log(`Found ${slides.length} slides:\n`);
    
    slides.forEach((slide, index) => {
      console.log(`${index + 1}. ${slide.title}`);
      console.log(`   - imageUrl: ${slide.imageUrl || 'NULL'}`);
      console.log(`   - image (Bytes): ${slide.image ? `${slide.image.length} bytes` : 'NULL'}`);
      console.log(`   - isActive: ${slide.isActive}`);
      console.log('');
    });
    
    // Check for slides without imageUrl
    const slidesWithoutUrl = slides.filter(s => !s.imageUrl);
    if (slidesWithoutUrl.length > 0) {
      console.log(`\n⚠️  WARNING: ${slidesWithoutUrl.length} slides don't have an imageUrl!`);
      console.log('These slides will cause errors in the application.');
      console.log('\nYou can either:');
      console.log('1. Delete these slides from the admin panel');
      console.log('2. Edit them and upload new images');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
