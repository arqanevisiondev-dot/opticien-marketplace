import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function manageAdmin() {
  try {
    // Find all admin users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        businessName: true,
        createdAt: true,
      },
    });

    console.log('\n📋 Current Admin Accounts:');
    console.log('=====================================');
    
    if (admins.length === 0) {
      console.log('❌ No admin accounts found!');
      console.log('\nCreating default admin account...\n');
      
      const email = 'admin@opticien.com';
      const password = 'Admin123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'ADMIN',
          businessName: 'Arqane Vision',
          phone: '+212600000000',
          whatsapp: '+212600000000',
          description: 'Official supplier and administrator',
          address: '123 Rue Principale',
          city: 'Casablanca',
          postalCode: '20000',
        },
      });

      console.log('✅ Admin account created!');
      console.log('-----------------------------------');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('👤 ID:', admin.id);
      console.log('-----------------------------------');
    } else {
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. Admin Account:`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   🏢 Business: ${admin.businessName || 'N/A'}`);
        console.log(`   👤 ID: ${admin.id}`);
        console.log(`   📅 Created: ${admin.createdAt.toLocaleDateString()}`);
      });
      
      console.log('\n=====================================');
      console.log('\n💡 To reset password for an admin:');
      console.log('   Run: npx tsx scripts/reset-admin-password.ts <email>');
    }
    
    console.log('\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manageAdmin();
