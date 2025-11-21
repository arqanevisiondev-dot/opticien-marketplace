import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'OPTICIAN') {
      return NextResponse.json({ businessName: null }, { status: 200 });
    }

    const optician = await prisma.optician.findUnique({
      where: { userId: session.user.id },
      select: { businessName: true },
    });

    return NextResponse.json({ businessName: optician?.businessName ?? null });
  } catch (error) {
    return NextResponse.json({ businessName: null }, { status: 200 });
  }
}
