import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

// PUT update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, imageUrl } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Generate new slug if name changed
    let finalSlug = existingCategory.slug;
    if (name !== existingCategory.name) {
      const baseSlug = slugify(name);
      
      const existingWithSlug = await prisma.category.findMany({
        where: {
          slug: {
            startsWith: baseSlug
          },
          id: {
            not: id
          }
        },
        select: { slug: true }
      });
      
      const existingSlugs = existingWithSlug.map((c: { slug: string }) => c.slug);
      finalSlug = baseSlug;
      let counter = 1;
      
      while (existingSlugs.includes(finalSlug)) {
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: finalSlug,
        description: description || null,
        imageUrl: imageUrl || null,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: `Erreur lors de la mise à jour de la catégorie: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Check if category has products
    if (category._count.products > 0 && !force) {
      return NextResponse.json(
        { 
          error: 'Cette catégorie contient des produits',
          productCount: category._count.products,
          canForceDelete: true,
        },
        { status: 400 }
      );
    }

    // Delete category (products will be set to null due to onDelete: SetNull)
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: 'Catégorie supprimée avec succès',
      productCount: category._count.products,
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: `Erreur lors de la suppression de la catégorie: ${errorMessage}` },
      { status: 500 }
    );
  }
}
