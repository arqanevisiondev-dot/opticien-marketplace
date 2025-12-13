import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function geocodeAddress(address: string, city?: string, postalCode?: string) {
  try {
    // Try 1: Full address
    let query = [address, postalCode, city, 'Morocco'].filter(Boolean).join(', ');
    console.log('Try 1 - Full address:', query);
    let encodedQuery = encodeURIComponent(query);
    
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`;
    
    let response = await fetch(url, {
      headers: {
        'User-Agent': 'OpticienMarketplace/1.0'
      }
    });

    let data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    
    // Try 2: Just city + country
    if (city) {
      console.log('\nTry 2 - City only:', city);
      query = `${city}, Morocco`;
      encodedQuery = encodeURIComponent(query);
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`;
      
      response = await fetch(url, {
        headers: {
          'User-Agent': 'OpticienMarketplace/1.0'
        }
      });

      data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
      
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

async function main() {
  console.log('🔍 Finding opticians without coordinates...\n');

  const opticians = await prisma.optician.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null }
      ]
    }
  });

  console.log(`Found ${opticians.length} opticians without coordinates\n`);

  for (const optician of opticians) {
    console.log('---');
    console.log('Optician:', optician.businessName);
    console.log('Address:', optician.address);
    console.log('City:', optician.city);
    console.log('Postal Code:', optician.postalCode);
    
    if (!optician.address) {
      console.log('❌ No address provided\n');
      continue;
    }

    const coords = await geocodeAddress(
      optician.address,
      optician.city || undefined,
      optician.postalCode || undefined
    );

    if (coords) {
      console.log('✅ Found coordinates:', coords);
      
      await prisma.optician.update({
        where: { id: optician.id },
        data: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        }
      });
      
      console.log('✅ Updated in database\n');
    } else {
      console.log('❌ Could not geocode\n');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('✅ Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
