import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const slide = await prisma.slide.update({
      where: { id },
      data: {
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        imageUrl: body.imageUrl,
        imageUrlTablet: body.imageUrlTablet,
        imageUrlMobile: body.imageUrlMobile,
        type: body.type,
        linkUrl: body.linkUrl,
        linkText: body.linkText,
        isActive: body.isActive,
        order: body.order,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        backgroundColor: body.backgroundColor,
        textColor: body.textColor,
        buttonColor: body.buttonColor,
      },
    });

    return NextResponse.json(slide);
  } catch (error) {
    console.error('Error updating slide:', error);
    return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.slide.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting slide:', error);
    return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
  }
}
