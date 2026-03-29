import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB per file

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const formData = await request.formData();

    // Support both single file (field "file") and multiple files (field "files")
    const singleFile = formData.get('file') as File | null;
    const multipleFiles = formData.getAll('files') as File[];
    const files = singleFile ? [singleFile] : multipleFiles;

    if (files.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Type de fichier non autorisé: ${file.type}` },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `La taille du fichier dépasse la limite de 5 Mo` },
          { status: 400 }
        );
      }

      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const filename = `products/${randomUUID()}.${ext}`;
      const blob = await put(filename, file, { access: 'public' });
      urls.push(blob.url);
    }

    // Return compatible response: `url` for single-file callers, `urls` for multi-file callers
    return NextResponse.json({ url: urls[0], urls });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload des images' },
      { status: 500 }
    );
  }
}
