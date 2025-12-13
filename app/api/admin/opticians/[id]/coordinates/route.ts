import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { latitude, longitude } = body;
    // normalize params (Next may provide params as a Promise in some envs)
    const paramsObj = 'params' in context && context.params ? await (context as any).params : (context as any).params;
    const id = paramsObj?.id;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const optician = await prisma.optician.update({
      where: { id },
      data: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });

    return NextResponse.json(optician);
  } catch (error) {
    console.error('Error updating optician coordinates:', error);
    return NextResponse.json(
      { error: 'Failed to update coordinates' },
      { status: 500 }
    );
  }
}
