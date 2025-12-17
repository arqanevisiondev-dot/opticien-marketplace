// app/api/auth/signup/route.ts
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
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
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

    // Use coordinates from map picker (user-selected = most accurate!)
    let latitude = validatedData.latitude;
    let longitude = validatedData.longitude;

    // Only fallback to geocoding if coordinates not provided
    if (!latitude || !longitude) {
      if (validatedData.address || validatedData.city) {
        const coords = await geocodeAddress(
          validatedData.address,
          validatedData.city,
          validatedData.postalCode
        );
        
        if (coords) {
          latitude = coords.lat;
          longitude = coords.lng;
        }
      }
    }

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
            latitude: latitude ?? undefined,
            longitude: longitude ?? undefined,
            status: 'PENDING',
            loyaltyPoints: 0,
          },
        },
      },
      include: {
        optician: true,
      },
    });

    // Send email notification to admin
    try {
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { email: true },
      });

      if (admin?.email) {
        const { sendEmailWithNodemailer } = await import('@/lib/email');
        
        const emailHtml = `
          <h2>🆕 Nouvelle Inscription Opticien</h2>
          <p><strong>👤 Nom:</strong> ${validatedData.firstName} ${validatedData.lastName}</p>
          <p><strong>🏢 Entreprise:</strong> ${validatedData.businessName}</p>
          <p><strong>📧 Email:</strong> ${validatedData.email}</p>
          <p><strong>📱 Téléphone:</strong> ${validatedData.phone}</p>
          <p><strong>📍 Ville:</strong> ${validatedData.city || 'N/A'}</p>
          ${latitude && longitude ? `<p><strong>🗺️ Coordonnées:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>` : ''}
          <hr>
          <p>✅ <a href="${process.env.NEXTAUTH_URL}/admin/opticians">Approuver ce compte dans le dashboard</a></p>
        `;

        sendEmailWithNodemailer(
          admin.email,
          '🆕 Nouvelle Inscription Opticien',
          emailHtml
        ).catch(err => console.error('Email send failed:', err));
      }
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
    }

    return NextResponse.json(
      { 
        message: 'Inscription réussie. Votre compte sera vérifié par notre équipe.',
        userId: user.id,
        coordinates: latitude && longitude ? { lat: latitude, lng: longitude } : null
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

// FREE Fallback geocoding function (only used if user doesn't select on map)
async function geocodeAddress(
  address?: string,
  city?: string,
  postalCode?: string
): Promise<{lat: number, lng: number} | null> {
  if (!address && !city) return null;

  try {
    // Build query prioritizing most specific info
    const query = [address, postalCode, city, 'Morocco']
      .filter(Boolean)
      .join(', ');
    
    const encodedQuery = encodeURIComponent(query);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1&countrycodes=ma`,
      {
        headers: {
          'User-Agent': 'OpticienMarketplace/1.0'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    // Fallback to city only if full address failed
    if (city && address) {
      const cityQuery = encodeURIComponent(`${city}, Morocco`);
      const cityResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${cityQuery}&limit=1&countrycodes=ma`,
        {
          headers: {
            'User-Agent': 'OpticienMarketplace/1.0'
          }
        }
      );
      
      const cityData = await cityResponse.json();
      
      if (cityData && cityData.length > 0) {
        return {
          lat: parseFloat(cityData[0].lat),
          lng: parseFloat(cityData[0].lon)
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
}