import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

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

    const body = await request.json();
    const {
      name,
      reference,
      description,
      categoryId,
      material,
      gender,
      shape,
      color,
      price,
      images,
      inStock,
    } = body;

    // Validation
    if (!name || !reference || !price) {
      return NextResponse.json(
        { error: 'Nom, référence et prix sont requis' },
        { status: 400 }
      );
    }

    // Récupérer le fournisseur par défaut (OptiMarket)
    const defaultSupplier = await prisma.supplier.findUnique({
      where: { email: 'admin@optimarket.com' },
    });

    if (!defaultSupplier) {
      console.error('Default supplier not found. Please run: pnpm db:seed');
      return NextResponse.json(
        { error: 'Fournisseur par défaut introuvable. Veuillez exécuter: pnpm db:seed' },
        { status: 500 }
      );
    }

    // Générer le slug à partir du nom
    const baseSlug = slugify(name);
    
    // Vérifier si le slug existe déjà et générer un slug unique
    const existingWithSlug = await prisma.product.findMany({
      where: {
        slug: {
          startsWith: baseSlug
        }
      },
      select: { slug: true }
    });
    
    const existingSlugs = existingWithSlug.map((p: { slug: string }) => p.slug);
    let finalSlug = baseSlug;
    let counter = 1;
    
    while (existingSlugs.includes(finalSlug)) {
      counter++;
      finalSlug = `${baseSlug}-${counter}`;
    }
    
    // Vérifier si la référence existe déjà
    const existing = await prisma.product.findUnique({
      where: { reference },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Un produit avec cette référence existe déjà' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        supplierId: defaultSupplier.id,
        categoryId: categoryId || null,
        name,
        slug: finalSlug,
        reference,
        description: description || null,
        material: material || null,
        gender: gender || null,
        shape: shape || null,
        color: color || null,
        price: typeof price === 'number' ? price : parseFloat(price),
        images: images || '[]',
        inStock: inStock !== undefined ? inStock : true,
      },
      include: {
        supplier: true,
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: `Erreur lors de la création du produit: ${errorMessage}` },
      { status: 500 }
    );
  }
}
