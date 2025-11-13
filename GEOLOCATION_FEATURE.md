# Geolocation Feature Implementation

## Overview
This document describes the geolocation feature that helps users find the nearest opticians when viewing products.

## Features Implemented

### 1. GPS-Based Location Detection
- **Automatic GPS Request**: When a user views a product, they can request their GPS location
- **Permission Handling**: Gracefully handles permission denied, unavailable, and timeout scenarios
- **Distance Calculation**: Uses Haversine formula to calculate distances between user and opticians

### 2. City-Based Search Fallback
- **Search by City**: If GPS is denied or unavailable, users can search by city name
- **Flexible Search**: Case-insensitive search for city names
- **No GPS Required**: Works without any location permissions

### 3. Nearest Opticians Display
- **Sorted by Distance**: When GPS is used, opticians are sorted by proximity
- **Distance Display**: Shows distance in kilometers for each optician
- **Contact Options**: Direct phone call and WhatsApp buttons
- **Map View**: Interactive map showing optician locations
- **List View**: Detailed list with addresses and contact information

## Technical Implementation

### API Endpoint
**File**: `/app/api/opticians/nearest/route.ts`

**Endpoint**: `GET /api/opticians/nearest`

**Query Parameters**:
- `latitude` (optional): User's latitude coordinate
- `longitude` (optional): User's longitude coordinate
- `city` (optional): City name to search
- `limit` (optional, default: 10): Maximum number of results

**Response**: Array of opticians with distance (if GPS used)

```typescript
interface OpticianResponse {
  id: string;
  businessName: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // Only present when GPS coordinates provided
}
```

### Geolocation Hook
**File**: `/hooks/useGeolocation.ts`

Custom React hook that manages geolocation state:
- Requests browser geolocation permission
- Handles success and error states
- Provides loading state
- Returns coordinates and permission status

### Nearest Optician Finder Component
**File**: `/components/opticians/NearestOpticianFinder.tsx`

Main UI component that:
- Requests user location or city search
- Fetches nearest opticians from API
- Displays results in list or map view
- Handles all error states gracefully

### Integration
The component is integrated into the product detail page (`/app/catalogue/[id]/page.tsx`), appearing below the product information and supplier details.

## User Flow

### Scenario 1: GPS Enabled
1. User views a product
2. Clicks "Use my location" button
3. Browser requests location permission
4. If granted, system finds 5 nearest opticians
5. Results show distance and are sorted by proximity

### Scenario 2: GPS Denied
1. User views a product
2. Clicks "Use my location" but denies permission
3. System shows fallback message
4. User can search by city name instead
5. Results show all opticians in that city

### Scenario 3: Direct City Search
1. User views a product
2. Clicks "Search by city"
3. Enters city name
4. System shows all opticians in that city

## Translations
All UI text is fully translated in French, English, and Arabic:
- `findNearestOptician`: Title of the section
- `findOpticianForProduct`: Description text
- `allowLocationAccess`: GPS permission request message
- `useMyLocation`: GPS button text
- `searchByCity`: City search button text
- `locationDenied`: Error message when GPS denied
- `enterCity`: City input placeholder
- `searchingOpticians`: Loading message

## Database Schema
The feature uses existing `Optician` model fields:
- `latitude`: GPS latitude coordinate
- `longitude`: GPS longitude coordinate
- `city`: City name for text-based search
- `status`: Only APPROVED opticians are shown

## Distance Calculation
Uses the Haversine formula to calculate great-circle distances between two points on Earth:

```typescript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  // ... Haversine formula implementation
  return distance; // in kilometers
}
```

## Browser Compatibility
- **Geolocation API**: Supported in all modern browsers
- **Fallback**: City search works on all browsers
- **Progressive Enhancement**: Feature degrades gracefully

## Privacy Considerations
- Location is never stored on the server
- Location is only used for the current search
- Users can always opt for city search instead
- Clear messaging about location usage

## Future Enhancements
1. **Radius Filter**: Allow users to specify search radius
2. **Product Availability**: Show which opticians have the specific product
3. **Appointment Booking**: Direct booking integration
4. **Route Planning**: Integration with maps for directions
5. **Saved Locations**: Remember user's preferred location
6. **Multiple Locations**: Support for users with multiple addresses

## Testing
To test the feature:
1. Navigate to any product detail page
2. Scroll to "Find an optician near you" section
3. Test GPS flow by clicking "Use my location"
4. Test city search by entering a city name
5. Verify map and list views work correctly
6. Test on mobile devices for GPS accuracy

## API Examples

### Find nearest opticians by GPS:
```
GET /api/opticians/nearest?latitude=48.8566&longitude=2.3522&limit=5
```

### Find opticians by city:
```
GET /api/opticians/nearest?city=Paris&limit=10
```

### Find all approved opticians:
```
GET /api/opticians/nearest?limit=20
```
