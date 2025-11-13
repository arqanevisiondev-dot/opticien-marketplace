import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

// POST create new category
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const baseSlug = slugify(name);
    
    // Check if slug exists and generate unique slug
    const existingWithSlug = await prisma.category.findMany({
      where: {
        slug: {
          startsWith: baseSlug
        }
      },
      select: { slug: true }
    });
    
    const existingSlugs = existingWithSlug.map(c => c.slug);
    let finalSlug = baseSlug;
    let counter = 1;
    
    while (existingSlugs.includes(finalSlug)) {
      counter++;
      finalSlug = `${baseSlug}-${counter}`;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: `Erreur lors de la création de la catégorie: ${errorMessage}` },
      { status: 500 }
    );
  }
}
