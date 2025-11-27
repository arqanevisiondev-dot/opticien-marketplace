import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = process.argv[2] || 'admin@opticien.com';
    const newPassword = process.argv[3] || 'Admin123!';
    
    console.log(`\n🔄 Resetting password for: ${email}\n`);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      console.log('\n💡 Creating new admin account...\n');
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      
      console.log('✅ New admin account created!');
      console.log('=====================================');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', newPassword);
      console.log('👤 ID:', newUser.id);
      console.log('=====================================\n');
      return;
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log('✅ Password updated successfully!');
    console.log('=====================================');
    console.log('📧 Email:', email);
    console.log('🔑 New Password:', newPassword);
    console.log('👤 Role:', user.role);
    console.log('=====================================\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
