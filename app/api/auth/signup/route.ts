import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  businessName: z.string().min(2, 'Le nom de l\'entreprise est requis'),
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  phone: z.string().min(10, 'Le numéro de téléphone est invalide'),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user and optician profile
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        role: 'OPTICIAN',
        optician: {
          create: {
            businessName: validatedData.businessName,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            phone: validatedData.phone,
            whatsapp: validatedData.whatsapp,
            address: validatedData.address,
            city: validatedData.city,
            postalCode: validatedData.postalCode,
            status: 'PENDING',
          },
        },
      },
      include: {
        optician: true,
      },
    });

    // Send email notification to admin (automatic in background)
    try {
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { email: true, whatsapp: true },
      });

      if (admin?.email) {
        // Send email notification automatically
        const { sendEmailWithNodemailer } = await import('@/lib/email');
        
        const emailHtml = `
          <h2>🆕 Nouvelle Inscription Opticien</h2>
          <p><strong>👤 Nom:</strong> ${validatedData.firstName} ${validatedData.lastName}</p>
          <p><strong>🏢 Entreprise:</strong> ${validatedData.businessName}</p>
          <p><strong>📧 Email:</strong> ${validatedData.email}</p>
          <p><strong>📱 Téléphone:</strong> ${validatedData.phone}</p>
          <p><strong>📍 Ville:</strong> ${validatedData.city || 'N/A'}</p>
          <p><strong>📮 Code Postal:</strong> ${validatedData.postalCode || 'N/A'}</p>
          <hr>
          <p>✅ <a href="${process.env.NEXTAUTH_URL}/admin/opticians">Approuver ce compte dans le dashboard</a></p>
        `;

        // Send email in background (non-blocking)
        sendEmailWithNodemailer(
          admin.email,
          '🆕 Nouvelle Inscription Opticien',
          emailHtml
        ).catch(err => console.error('Email send failed:', err));
      }

      // Also generate WhatsApp link for manual notification if needed
      if (admin?.whatsapp) {
        const message = `🆕 *Nouvelle Inscription Opticien*\n\n` +
          `👤 Nom: ${validatedData.firstName} ${validatedData.lastName}\n` +
          `🏢 Entreprise: ${validatedData.businessName}\n` +
          `📧 Email: ${validatedData.email}\n` +
          `📱 Téléphone: ${validatedData.phone}\n` +
          `📍 Ville: ${validatedData.city || 'N/A'}\n` +
          `📮 Code Postal: ${validatedData.postalCode || 'N/A'}\n\n` +
          `✅ Veuillez approuver ce compte dans le dashboard admin.`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappPhone = admin.whatsapp.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;
        
        // Return with WhatsApp URL (optional manual notification)
        return NextResponse.json(
          { 
            message: 'Inscription réussie. Votre compte sera vérifié par notre équipe.',
            userId: user.id,
            whatsappNotificationUrl: whatsappUrl
          },
          { status: 201 }
        );
      }
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
    }

    return NextResponse.json(
      { 
        message: 'Inscription réussie. Votre compte sera vérifié par notre équipe.',
        userId: user.id 
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
}
