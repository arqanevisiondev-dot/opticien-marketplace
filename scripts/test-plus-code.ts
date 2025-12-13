async function testAddress() {
  // Test different address formats
  const tests = [
    "X7Q6+29 Sala Al Jadida, Morocco",
    "Sala Al Jadida, Morocco",
    "Sala Aljadida, Morocco", 
    "Sala Jadida, Morocco"
  ];
  
  for (const address of tests) {
    console.log('\n---\nTesting:', address);
    const encodedQuery = encodeURIComponent(address);
    
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
      console.log('✅ Coordinates:', data[0].lat, data[0].lon);
      console.log('Display name:', data[0].display_name);
    } else {
      console.log('❌ No results found');
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testAddress().catch(console.error);
