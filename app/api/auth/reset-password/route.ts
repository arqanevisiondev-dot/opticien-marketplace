import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token et mot de passe requis' }, { status: 400 });
    }

    // Find user with matching token
    let user;
    try {
      user = await prisma.user.findFirst({ where: { resetToken: token } });
    } catch (e) {
      console.error('Prisma query error (findFirst):', e);
      return NextResponse.json({ error: 'Erreur serveur (vérifiez la migration Prisma)' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    // Normalize expiry to a timestamp in ms (handle Date or string)
    const expiryTs = user.resetTokenExpiry ? new Date(user.resetTokenExpiry).getTime() : NaN;
    if (!expiryTs || isNaN(expiryTs) || expiryTs < Date.now()) {
      return NextResponse.json({ error: 'Le lien a expiré' }, { status: 400 });
    }

    // Hash new password
    const hashed = await bcrypt.hash(password, 10);

    // Update user password and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
     console.error('Reset password error:', err instanceof Error ? err.stack || err.message : err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
