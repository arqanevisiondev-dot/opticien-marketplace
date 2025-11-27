import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@opticien.com';
    const password = 'Admin123!';
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('Email:', email);
      console.log('Use existing password or update as needed.');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
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

    console.log('✅ Admin user created successfully!');
    console.log('-----------------------------------');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('-----------------------------------');
    console.log('⚠️  Please save these credentials and change the password after first login!');
    console.log('User ID:', admin.id);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
