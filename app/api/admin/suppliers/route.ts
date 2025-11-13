import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { name, email, phone, whatsapp, description } = await request.json();

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Nom, email et téléphone sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existing = await prisma.supplier.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Un fournisseur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        whatsapp: whatsapp || null,
        description: description || null,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du fournisseur' },
      { status: 500 }
    );
  }
}
