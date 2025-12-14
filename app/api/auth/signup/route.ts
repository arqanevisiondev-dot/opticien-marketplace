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

    // Geocode address if provided
    let latitude: number | undefined;
    let longitude: number | undefined;
    
    if (validatedData.address) {
      try {
        // Try 0: Check if address is a Plus Code (e.g., "X7Q6+29 Sala Al Jadida")
        const plusCodeRegex = /^[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}/i;
        if (plusCodeRegex.test(validatedData.address.trim())) {
          const query = validatedData.address.includes(',') 
            ? validatedData.address 
            : `${validatedData.address}, Morocco`;
          const encodedQuery = encodeURIComponent(query);
          
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`,
            {
              headers: {
                'User-Agent': 'OpticienMarketplace/1.0'
              }
            }
          );
          
          const geoData = await geoResponse.json();
          
          if (geoData && geoData.length > 0) {
            latitude = parseFloat(geoData[0].lat);
            longitude = parseFloat(geoData[0].lon);
            console.log(`✅ Geocoded Plus Code: ${latitude}, ${longitude}`);
          }
        }
        
        // Try 1: Full address with Morocco (if not Plus Code or Plus Code failed)
        if (!latitude && !longitude) {
          const query = [validatedData.address, validatedData.postalCode, validatedData.city, 'Morocco']
            .filter(Boolean)
            .join(', ');
          const encodedQuery = encodeURIComponent(query);
        
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`,
            {
              headers: {
                'User-Agent': 'OpticienMarketplace/1.0'
              }
            }
          );
          
          const geoData = await geoResponse.json();
          
          if (geoData && geoData.length > 0) {
            latitude = parseFloat(geoData[0].lat);
            longitude = parseFloat(geoData[0].lon);
            console.log(`✅ Geocoded full address: ${latitude}, ${longitude}`);
          }
        }
        
        // Try 2: Fallback to city + Morocco if full address didn't work
        if (!latitude && !longitude && validatedData.city) {
          const query = `${validatedData.city}, Morocco`;
          const encodedQuery = encodeURIComponent(query);
          
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`,
            {
              headers: {
                'User-Agent': 'OpticienMarketplace/1.0'
              }
            }
          );
          
          const geoData = await geoResponse.json();
          
          if (geoData && geoData.length > 0) {
            latitude = parseFloat(geoData[0].lat);
            longitude = parseFloat(geoData[0].lon);
            console.log(`✅ Geocoded city: ${latitude}, ${longitude}`);
          }
        }
      } catch (error) {
        console.error('Geocoding failed during signup:', error);
        // Continue without coordinates - can be added later
      }
    }

    // Create user and optician profile (loyalty points awarded on admin approval)
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
            latitude,
            longitude,
            status: 'PENDING',
            loyaltyPoints: 0,
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
      // Previously we returned a WhatsApp URL to notify the admin manually.
      // The admin is notified by email now (we only have a single admin), so continue to final response.
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
