import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const limit = parseInt(searchParams.get('limit') || '50');
    const radius = parseFloat(searchParams.get('radius') || '50'); // Default 50km radius

    console.log('API Request:', { latitude, longitude, city, limit, radius });

    // Fetch approved opticians
    const whereClause = city
      ? {
          status: 'APPROVED' as const,
          city: { contains: city },
        }
      : {
          status: 'APPROVED' as const,
        };

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

    console.log(`Found ${opticians.length} opticians before filtering`);

    // If GPS coordinates provided, calculate distances and filter by radius
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);

      type Optician = typeof opticians[number];
      type OpticianWithDistance = Optician & { distance?: number };

      const opticiansWithDistance: OpticianWithDistance[] = opticians
        .map((optician) => {
          // Only calculate distance if optician has coordinates
          if (optician.latitude && optician.longitude) {
            return {
              ...optician,
              distance: calculateDistance(
                userLat,
                userLon,
                optician.latitude,
                optician.longitude
              ),
            };
          }
          // Return optician without distance if no coordinates
          return { ...optician };
        })
        .filter((o: OpticianWithDistance) => {
          // If no distance calculated, don't filter out
          if (o.distance === undefined) return true;
          return o.distance <= radius;
        })
        .sort((a: OpticianWithDistance, b: OpticianWithDistance) => {
          // Opticians with distance come first
          if (a.distance === undefined && b.distance === undefined) return 0;
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        })
        .slice(0, limit);

      console.log(`Returning ${opticiansWithDistance.length} opticians (${opticiansWithDistance.filter(o => o.distance !== undefined).length} with distance)`);
      return NextResponse.json(opticiansWithDistance);
    }

    // If only city search, return opticians in that city
    if (city) {
      console.log(`Returning ${opticians.length} opticians for city: ${city}`);
      return NextResponse.json(opticians.slice(0, limit));
    }

    // If no filters, return all opticians (limited)
    console.log(`Returning ${opticians.length} opticians (no filters)`);
    return NextResponse.json(opticians.slice(0, limit));
  } catch (error) {
    console.error('Error fetching nearest opticians:', error);
    return NextResponse.json(
      { error: 'Error fetching opticians' },
      { status: 500 }
    );
  }
}
