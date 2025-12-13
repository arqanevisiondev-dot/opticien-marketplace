/**
 * Calculate distance between two geographic coordinates using the Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance with appropriate unit
 * @param distance - Distance in kilometers
 * @returns Formatted string with unit
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
}

/**
 * Calculate map bounds that contain all given coordinates
 * @param coordinates - Array of [lat, lng] coordinates
 * @returns Bounds object with north, south, east, west
 */
export function calculateBounds(coordinates: [number, number][]) {
  if (coordinates.length === 0) {
    return null;
  }

  let north = coordinates[0][0];
  let south = coordinates[0][0];
  let east = coordinates[0][1];
  let west = coordinates[0][1];

  coordinates.forEach(([lat, lng]) => {
    if (lat > north) north = lat;
    if (lat < south) south = lat;
    if (lng > east) east = lng;
    if (lng < west) west = lng;
  });

  return { north, south, east, west };
}

/**
 * Check if a coordinate is within a given radius of another coordinate
 * @param centerLat - Center latitude
 * @param centerLon - Center longitude
 * @param pointLat - Point latitude
 * @param pointLon - Point longitude
 * @param radiusKm - Radius in kilometers
 * @returns True if point is within radius
 */
export function isWithinRadius(
  centerLat: number,
  centerLon: number,
  pointLat: number,
  pointLon: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(centerLat, centerLon, pointLat, pointLon);
  return distance <= radiusKm;
}

/**
 * Group items by city and sort by distance within each city
 */
export function groupByCity<T extends { city?: string; distance?: number }>(
  items: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  items.forEach((item) => {
    const city = item.city || 'Unknown';
    if (!groups.has(city)) {
      groups.set(city, []);
    }
    groups.get(city)!.push(item);
  });

  // Sort items within each city by distance
  groups.forEach((cityItems) => {
    cityItems.sort((a, b) => {
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });
  });

  return groups;
}

/**
 * Sort cities by their closest optician's distance
 */
export function sortCitiesByDistance(groupedItems: Map<string, Array<{ distance?: number }>>): string[] {
  return Array.from(groupedItems.entries())
    .sort(([, itemsA], [, itemsB]) => {
      const distanceA = itemsA[0]?.distance ?? Infinity;
      const distanceB = itemsB[0]?.distance ?? Infinity;
      return distanceA - distanceB;
    })
    .map(([city]) => city);
}
