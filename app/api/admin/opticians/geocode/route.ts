import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Geocode address using Nominatim (OpenStreetMap) - Free alternative to Google Maps API
 * Uses fallback strategy: Plus Code > Full address > City-level
 */
async function geocodeAddress(address: string, city?: string, postalCode?: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // Try 0: Check if address is a Plus Code (e.g., "X7Q6+29 Sala Al Jadida")
    const plusCodeRegex = /^[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}/i;
    if (plusCodeRegex.test(address.trim())) {
      const query = address.includes(',') ? address : `${address}, Morocco`;
      const encodedQuery = encodeURIComponent(query);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`,
        {
          headers: {
            'User-Agent': 'OpticienMarketplace/1.0'
          }
        }
      );

      const data = await response.json();
      
      if (data && data.length > 0) {
        console.log(`✅ Geocoded Plus Code: ${data[0].lat}, ${data[0].lon}`);
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
    }
    
    // Try 1: Full address with Morocco
    let query = [address, postalCode, city, 'Morocco'].filter(Boolean).join(', ');
    let encodedQuery = encodeURIComponent(query);
    
    let response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`,
      {
        headers: {
          'User-Agent': 'OpticienMarketplace/1.0'
        }
      }
    );

    let data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    
    // Try 2: Fallback to city + Morocco if full address didn't work
    if (city) {
      query = `${city}, Morocco`;
      encodedQuery = encodeURIComponent(query);
      
      response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`,
        {
          headers: {
            'User-Agent': 'OpticienMarketplace/1.0'
          }
        }
      );

      data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opticianId } = body;

    if (!opticianId) {
      // Geocode all opticians without coordinates
      const opticiansWithoutCoords = await prisma.optician.findMany({
        where: {
          OR: [
            { latitude: null },
            { longitude: null }
          ],
          address: { not: null }
        }
      });

      console.log(`Found ${opticiansWithoutCoords.length} opticians to geocode`);

      let successCount = 0;
      let failCount = 0;

      for (const optician of opticiansWithoutCoords) {
        if (!optician.address) continue;

        console.log(`Geocoding: ${optician.businessName} - ${optician.address}`);
        
        const coords = await geocodeAddress(
          optician.address,
          optician.city || undefined,
          optician.postalCode || undefined
        );

        if (coords) {
          await prisma.optician.update({
            where: { id: optician.id },
            data: {
              latitude: coords.latitude,
              longitude: coords.longitude,
            }
          });
          successCount++;
          console.log(`✅ Success: ${optician.businessName} - ${coords.latitude}, ${coords.longitude}`);
        } else {
          failCount++;
          console.log(`❌ Failed: ${optician.businessName}`);
        }

        // Rate limiting - wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return NextResponse.json({
        message: 'Geocoding completed',
        total: opticiansWithoutCoords.length,
        success: successCount,
        failed: failCount
      });
    } else {
      // Geocode single optician
      const optician = await prisma.optician.findUnique({
        where: { id: opticianId }
      });

      if (!optician) {
        return NextResponse.json(
          { error: 'Optician not found' },
          { status: 404 }
        );
      }

      if (!optician.address) {
        return NextResponse.json(
          { error: 'No address to geocode' },
          { status: 400 }
        );
      }

      const coords = await geocodeAddress(
        optician.address,
        optician.city || undefined,
        optician.postalCode || undefined
      );

      if (coords) {
        await prisma.optician.update({
          where: { id: opticianId },
          data: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          }
        });

        return NextResponse.json({
          message: 'Geocoding successful',
          latitude: coords.latitude,
          longitude: coords.longitude
        });
      }

      return NextResponse.json(
        { error: 'Could not geocode address' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
