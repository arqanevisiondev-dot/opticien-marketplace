import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch approved opticians
    const whereClause: Prisma.OpticianWhereInput = {
      status: 'APPROVED',
    };

    if (city) {
      whereClause.city = {
        contains: city,
      };
    }

    const opticians = await prisma.optician.findMany({
      where: whereClause,
      select: {
        id: true,
        businessName: true,
        firstName: true,
        lastName: true,
        phone: true,
        whatsapp: true,
        address: true,
        city: true,
        postalCode: true,
        latitude: true,
        longitude: true,
      },
    });

    // If GPS coordinates provided, calculate distances and sort by proximity
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);

      const opticiansWithDistance = opticians
        .filter((o) => o.latitude && o.longitude)
        .map((optician) => ({
          ...optician,
          distance: calculateDistance(
            userLat,
            userLon,
            optician.latitude!,
            optician.longitude!
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

      return NextResponse.json(opticiansWithDistance);
    }

    // If only city search, return opticians in that city
    if (city) {
      return NextResponse.json(opticians.slice(0, limit));
    }

    // If no filters, return all opticians (limited)
    return NextResponse.json(opticians.slice(0, limit));
  } catch (error) {
    console.error('Error fetching nearest opticians:', error);
    return NextResponse.json(
      { error: 'Error fetching opticians' },
      { status: 500 }
    );
  }
}
