import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

type ProductPayload = {
  id?: string;
  name?: string;
  reference?: string;
  description?: string;
  categoryId?: string;
  material?: string;
  gender?: string;
  marque?: string;
  shape?: string;
  color?: string;
  price?: number | string;
  salePrice?: number | string | null;
  firstOrderRemisePct?: number | string | null;
  loyaltyPointsReward?: number | string | null;
  images?: unknown;
  inStock?: boolean;
  isNewCollection?: boolean;
};

function normalizeImages(rawImages: unknown) {
  try {
    if (Array.isArray(rawImages)) {
      return rawImages
        .filter(Boolean)
        .map((x: unknown) => String(x))
        .slice(0, 50);
    }
    if (typeof rawImages === 'string') {
      try {
        const parsed = JSON.parse(rawImages);
        if (Array.isArray(parsed)) {
          return parsed
            .filter(Boolean)
            .map((x: unknown) => String(x))
            .slice(0, 50);
        }
      } catch {
        return rawImages.trim() ? [rawImages.trim()] : [];
      }
    }
  } catch {}
  return [];
}

async function requireAdminSession() {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }
  return session;
}

async function buildUniqueSlug(name: string, productId?: string) {
  const baseSlug = slugify(name);
  const existingWithSlug = await prisma.product.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
      id: productId ? { not: productId } : undefined,
    },
    select: { slug: true },
  });
  const existingSlugs = existingWithSlug.map((p: { slug: string }) => p.slug);
  let finalSlug = baseSlug;
  let counter = 1;
  while (existingSlugs.includes(finalSlug)) {
    counter += 1;
    finalSlug = `${baseSlug}-${counter}`;
  }
  return finalSlug;
}

function parseNumber(value: number | string | null | undefined) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return typeof value === 'number' ? value : parseFloat(String(value));
}

function parseInteger(value: number | string | null | undefined) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return typeof value === 'number' ? Math.trunc(value) : parseInt(String(value), 10);
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true },
      });
      if (!product) {
        return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
      }
      const images = product.images ? JSON.parse(product.images) : [];
      return NextResponse.json({ product: { ...product, images } });
    }

    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des produits.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const body = (await request.json()) as ProductPayload;
    const {
      name,
      reference,
      description,
      categoryId,
      material,
      gender,
      marque,
      shape,
      color,
      price,
      salePrice,
      firstOrderRemisePct,
      loyaltyPointsReward,
      images: rawImages,
      inStock,
      isNewCollection,
    } = body;

    if (!name || !reference || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Nom, référence et prix sont requis' },
        { status: 400 }
      );
    }

    const parsedPrice = parseNumber(price);
    if (parsedPrice === null || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: 'Le prix doit être un nombre positif' },
        { status: 400 }
      );
    }

    const parsedSalePrice = parseNumber(salePrice);
    if (parsedSalePrice !== null && (!Number.isFinite(parsedSalePrice) || parsedSalePrice <= 0)) {
      return NextResponse.json(
        { error: 'Le prix soldé doit être un nombre positif' },
        { status: 400 }
      );
    }

    const parsedRemise = parseNumber(firstOrderRemisePct);
    if (parsedRemise !== null && (!Number.isFinite(parsedRemise) || parsedRemise < 0 || parsedRemise > 100)) {
      return NextResponse.json(
        { error: 'La remise doit être comprise entre 0 et 100%' },
        { status: 400 }
      );
    }

    const parsedLoyaltyPoints = parseInteger(loyaltyPointsReward);
    if (parsedLoyaltyPoints !== null && (!Number.isFinite(parsedLoyaltyPoints) || parsedLoyaltyPoints < 0)) {
      return NextResponse.json(
        { error: 'Les points de fidélité doivent être un entier positif ou nul' },
        { status: 400 }
      );
    }

    const baseSlug = await buildUniqueSlug(name);

    const existing = await prisma.product.findUnique({ where: { reference } });
    if (existing) {
      return NextResponse.json(
        { error: 'Un produit avec cette référence existe déjà' },
        { status: 400 }
      );
    }

    const imagesJson = JSON.stringify(normalizeImages(rawImages));

    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        categoryId: categoryId || null,
        name,
        slug: baseSlug,
        reference,
        description: description || null,
        material: material || null,
        gender: gender || null,
        marque: marque || null,
        shape: shape || null,
        color: color || null,
        price: parsedPrice,
        salePrice: parsedSalePrice,
        firstOrderRemisePct: parsedRemise,
        loyaltyPointsReward: parsedLoyaltyPoints,
        images: imagesJson,
        inStock: typeof inStock === 'boolean' ? inStock : true,
        isNewCollection: typeof isNewCollection === 'boolean' ? isNewCollection : false,
      },
      include: {
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

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = (await request.json()) as ProductPayload;
    const {
      id,
      name,
      reference,
      description,
      categoryId,
      material,
      gender,
      marque,
      shape,
      color,
      price,
      salePrice,
      firstOrderRemisePct,
      loyaltyPointsReward,
      images: rawImages,
      inStock,
      isNewCollection,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }

    const existingIsNewCollection =
      (existingProduct as { isNewCollection?: boolean }).isNewCollection ?? false;

    if (reference && reference !== existingProduct.reference) {
      const conflict = await prisma.product.findUnique({ where: { reference } });
      if (conflict && conflict.id !== id) {
        return NextResponse.json({ error: 'La référence est déjà utilisée' }, { status: 400 });
      }
    }

    const parsedPrice = price !== undefined ? parseNumber(price) : existingProduct.price;
    if (parsedPrice === null || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: 'Le prix doit être un nombre positif' },
        { status: 400 }
      );
    }

    const parsedSalePrice = salePrice !== undefined ? parseNumber(salePrice) : existingProduct.salePrice;
    if (parsedSalePrice !== null && (!Number.isFinite(parsedSalePrice) || parsedSalePrice <= 0)) {
      return NextResponse.json(
        { error: 'Le prix soldé doit être un nombre positif' },
        { status: 400 }
      );
    }

    const parsedRemise = firstOrderRemisePct !== undefined
      ? parseNumber(firstOrderRemisePct)
      : existingProduct.firstOrderRemisePct;
    if (parsedRemise !== null && (!Number.isFinite(parsedRemise) || parsedRemise < 0 || parsedRemise > 100)) {
      return NextResponse.json(
        { error: 'La remise doit être comprise entre 0 et 100%' },
        { status: 400 }
      );
    }

    const parsedLoyaltyPoints = loyaltyPointsReward !== undefined
      ? parseInteger(loyaltyPointsReward)
      : existingProduct.loyaltyPointsReward;
    if (parsedLoyaltyPoints !== null && (!Number.isFinite(parsedLoyaltyPoints) || parsedLoyaltyPoints < 0)) {
      return NextResponse.json(
        { error: 'Les points de fidélité doivent être un entier positif ou nul' },
        { status: 400 }
      );
    }

    const slug = name && name !== existingProduct.name
      ? await buildUniqueSlug(name, id)
      : existingProduct.slug;

    const imagesJson = rawImages !== undefined
      ? JSON.stringify(normalizeImages(rawImages))
      : existingProduct.images;

    const normalizedCategoryId = categoryId ? categoryId : null;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name || existingProduct.name,
        reference: reference || existingProduct.reference,
        description: description ?? existingProduct.description,
        categoryId: normalizedCategoryId ?? existingProduct.categoryId,
        material: material ?? existingProduct.material,
        gender: gender ?? existingProduct.gender,
        marque: marque ?? existingProduct.marque,
        shape: shape ?? existingProduct.shape,
        color: color ?? existingProduct.color,
        price: parsedPrice,
        salePrice: parsedSalePrice,
        firstOrderRemisePct: parsedRemise,
        loyaltyPointsReward: parsedLoyaltyPoints,
        images: imagesJson,
        slug,
        inStock: typeof inStock === 'boolean' ? inStock : existingProduct.inStock,
        isNewCollection:
          typeof isNewCollection === 'boolean' ? isNewCollection : existingIsNewCollection,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du produit.' },
      { status: 500 }
    );
  }
}
