import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all product options
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const options = await prisma.productOption.findMany({
      where: type ? { type } : undefined,
      orderBy: {
        value: 'asc',
      },
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error fetching product options:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des options' },
      { status: 500 }
    );
  }
}

// POST create new option
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, value } = body;

    if (!type || !value) {
      return NextResponse.json(
        { error: 'Type et valeur requis' },
        { status: 400 }
      );
    }

    if (!['material', 'gender'].includes(type)) {
      return NextResponse.json(
        { error: 'Type invalide. Utilisez "material" ou "gender"' },
        { status: 400 }
      );
    }

    const option = await prisma.productOption.create({
      data: {
        type,
        value,
      },
    });

    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    console.error('Error creating product option:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: `Erreur lors de la création de l'option: ${errorMessage}` },
      { status: 500 }
    );
  }
}
