# City Autocomplete Feature

## Overview
Enhancement to the geolocation feature that adds intelligent city autocomplete suggestions when users search for opticians by city name.

## Features

### 1. City Suggestions API
**Endpoint**: `GET /api/opticians/cities`

Returns a list of all unique cities where approved opticians are located, sorted alphabetically.

**Response Example**:
```json
[
  "Casablanca",
  "Marrakech",
  "Paris",
  "Rabat",
  "Tanger"
]
```

### 2. Real-time Autocomplete
- **Instant Filtering**: As users type, cities are filtered in real-time
- **Case-Insensitive**: Matches cities regardless of case
- **Partial Match**: Shows all cities containing the search term

### 3. Interactive Dropdown
- **Visual Feedback**: Hover effects on suggestions
- **Click to Select**: Click any suggestion to auto-search
- **Icon Indicators**: MapPin icon for each city
- **Scrollable**: Max height with scroll for many results
- **Click Outside**: Closes when clicking outside the dropdown

### 4. Smart UX
- **Auto-Search**: Automatically searches when a city is selected
- **Focus Behavior**: Shows suggestions when input is focused (if text exists)
- **Keyboard Support**: Press Enter to search with current text
- **Loading States**: Shows spinner during search

## Implementation Details

### Files Modified
1. **`/app/api/opticians/cities/route.ts`** (NEW)
   - Fetches unique cities from approved opticians
   - Returns sorted array of city names

2. **`/components/opticians/NearestOpticianFinder.tsx`**
   - Added city autocomplete state management
   - Implemented filtering logic
   - Added dropdown UI with suggestions
   - Click-outside detection with useRef

### State Management
```typescript
const [availableCities, setAvailableCities] = useState<string[]>([]);
const [showSuggestions, setShowSuggestions] = useState(false);
const [filteredCities, setFilteredCities] = useState<string[]>([]);
const searchRef = useRef<HTMLDivElement>(null);
```

### Filtering Logic
```typescript
useEffect(() => {
  if (citySearch.trim()) {
    const filtered = availableCities.filter(city =>
      city.toLowerCase().includes(citySearch.toLowerCase())
    );
    setFilteredCities(filtered);
    setShowSuggestions(filtered.length > 0);
  } else {
    setFilteredCities([]);
    setShowSuggestions(false);
  }
}, [citySearch, availableCities]);
```

### Click-Outside Detection
```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowSuggestions(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

## User Flow

### Scenario 1: Typing City Name
1. User clicks "Search by city"
2. Starts typing (e.g., "Par")
3. Dropdown shows matching cities: "Paris"
4. User clicks "Paris" from suggestions
5. System automatically searches for opticians in Paris
6. Results displayed with optician details

### Scenario 2: Manual Entry
1. User types full city name
2. Presses Enter or clicks Search button
3. System searches for opticians in that city
4. Results displayed

### Scenario 3: Browse All Cities
1. User clicks in the search field
2. Types a single letter (e.g., "M")
3. Sees all cities starting with or containing "M"
4. Can browse and select from list

## UI/UX Improvements

### Visual Design
- **Dropdown Styling**: White background with shadow for depth
- **Hover Effect**: Blue background on hover for clear feedback
- **Border Separation**: Subtle borders between suggestions
- **Icon Alignment**: MapPin icons aligned with text
- **Z-Index Management**: Proper layering to appear above other elements

### Accessibility
- **Keyboard Navigation**: Enter key to search
- **Focus Management**: Clear focus states
- **Click Targets**: Large, easy-to-click suggestion items
- **Visual Hierarchy**: Clear distinction between input and suggestions

## Performance Considerations

### Optimization
- **Single API Call**: Cities fetched once on component mount
- **Client-Side Filtering**: Fast, instant filtering without server calls
- **Debouncing**: Not needed as filtering is instant and lightweight
- **Memoization**: Could be added for very large city lists

### Scalability
- **Current**: Works well with dozens of cities
- **Future**: For hundreds of cities, consider:
  - Virtual scrolling for dropdown
  - Server-side filtering with debouncing
  - Fuzzy search for better matching

## Database Query
```typescript
const opticians = await prisma.optician.findMany({
  where: {
    status: 'APPROVED',
    city: { not: null },
  },
  select: { city: true },
  distinct: ['city'],
  orderBy: { city: 'asc' },
});
```

## Benefits

### For Users
1. **Faster Search**: No need to type full city name
2. **Discover Cities**: See all available locations
3. **Avoid Typos**: Select from correct spellings
4. **Better UX**: Smooth, modern autocomplete experience

### For Business
1. **Reduced Errors**: Fewer failed searches due to typos
2. **Discovery**: Users find opticians in cities they didn't know existed
3. **Professional Feel**: Modern, polished interface
4. **Conversion**: Easier to find opticians = more connections

## Testing

### Manual Testing
1. Navigate to any product page
2. Scroll to "Find an optician near you"
3. Click "Search by city"
4. Type partial city name
5. Verify suggestions appear
6. Click a suggestion
7. Verify auto-search works
8. Click outside dropdown
9. Verify dropdown closes

### Edge Cases
- Empty city list (no approved opticians)
- Single city available
- Very long city names
- Special characters in city names
- Multiple cities with similar names

## Future Enhancements

1. **Fuzzy Search**: Match even with typos (e.g., "Pris" → "Paris")
2. **Recent Searches**: Remember user's recent city searches
3. **Popular Cities**: Show most searched cities first
4. **Geolocation Integration**: Suggest nearest city based on GPS
5. **Multi-language**: Translate city names if needed
6. **Keyboard Navigation**: Arrow keys to navigate suggestions
7. **Highlighting**: Highlight matching text in suggestions
8. **City Metadata**: Show number of opticians per city in dropdown

## Browser Compatibility
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS/Android)

## Accessibility (WCAG)
- ✅ Keyboard accessible
- ✅ Screen reader friendly
- ✅ Sufficient color contrast
- ⚠️ Could add ARIA labels for better screen reader support

## Code Quality
- ✅ TypeScript typed
- ✅ React hooks best practices
- ✅ Clean, readable code
- ✅ Proper error handling
- ✅ Memory leak prevention (cleanup in useEffect)
