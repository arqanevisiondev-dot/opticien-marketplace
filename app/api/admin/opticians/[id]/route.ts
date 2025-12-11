import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
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

    const optician = await prisma.optician.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
      },
    });

    if (!optician) {
      return NextResponse.json(
        { error: 'Opticien introuvable' },
        { status: 404 }
      );
    }

    const [totalOrders, approvedOrders, pendingOrders, rejectedOrders, cancelledOrders, totalItemsApproved, lastOrder] = await Promise.all([
      prisma.order.count({ where: { opticianId: id } }),
      prisma.order.count({ where: { opticianId: id, status: 'APPROVED' } }),
      prisma.order.count({ where: { opticianId: id, status: 'PENDING' } }),
      prisma.order.count({ where: { opticianId: id, status: 'REJECTED' } }),
      prisma.order.count({ where: { opticianId: id, status: 'CANCELLED' } }),
      prisma.orderItem.aggregate({
        where: { order: { opticianId: id, status: 'APPROVED' } },
        _sum: { quantity: true },
      }),
      prisma.order.findFirst({
        where: { opticianId: id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, status: true },
      }),
    ]);

    const totalItemsValidated = totalItemsApproved?._sum?.quantity ?? 0;

    return NextResponse.json({
      id: optician.id,
      businessName: optician.businessName,
      firstName: optician.firstName,
      lastName: optician.lastName,
      phone: optician.phone,
      whatsapp: optician.whatsapp ?? null,
      address: optician.address ?? null,
      city: optician.city ?? null,
      postalCode: optician.postalCode ?? null,
      latitude: optician.latitude ?? null,
      longitude: optician.longitude ?? null,
      email: optician.user.email,
      status: optician.status,
      loyaltyPoints: optician.loyaltyPoints,
      createdAt: optician.createdAt.toISOString(),
      analytics: {
        totalOrders,
        pendingOrders,
        approvedOrders,
        rejectedOrders,
        cancelledOrders,
        totalItemsValidated,
        lastOrderAt: lastOrder?.createdAt?.toISOString() ?? null,
        lastOrderStatus: lastOrder?.status ?? null,
      },
    });
  } catch (error) {
    console.error('Error fetching optician:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'opticien' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    // Check current status to award points only on first approval
    const currentOptician = await prisma.optician.findUnique({
      where: { id },
      select: { status: true, loyaltyPoints: true },
    });

    const updateData: any = { status };

    // Award registration bonus points when approving for the first time
    if (status === 'APPROVED' && currentOptician?.status === 'PENDING') {
      try {
        const pointsSetting = await prisma.systemSettings.findUnique({
          where: { key: 'registration_bonus_points' },
        });
        if (pointsSetting) {
          const registrationPoints = parseInt(pointsSetting.value) || 0;
          if (registrationPoints > 0) {
            updateData.loyaltyPoints = {
              increment: registrationPoints,
            };
          }
        }
      } catch (error) {
        console.error('Error fetching registration points:', error);
      }
    }

    const optician = await prisma.optician.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(optician);
  } catch (error) {
    console.error('Error updating optician:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'opticien' },
      { status: 500 }
    );
  }
}
