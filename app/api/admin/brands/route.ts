import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des marques' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Le nom de la marque est requis' },
        { status: 400 }
      );
    }

    // Check if brand already exists
    const existing = await prisma.brand.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Cette marque existe déjà' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la marque' },
      { status: 500 }
    );
  }
}
