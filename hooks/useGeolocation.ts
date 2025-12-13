import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permission: 'granted' | 'denied' | 'prompt' | null;
  accuracy: number | null;
}

const CACHE_KEY = 'user_location_cache';
const CACHE_DURATION = 60000; // 1 minute

interface CachedLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    permission: null,
    accuracy: null,
  });

  // Don't auto-load cached location to ensure fresh permission prompt

  const getCachedLocation = (): CachedLocation | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const location: CachedLocation = JSON.parse(cached);
      const age = Date.now() - location.timestamp;

      if (age < CACHE_DURATION) {
        return location;
      } else {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
    } catch {
      return null;
    }
  };

  const cacheLocation = (latitude: number, longitude: number, accuracy: number) => {
    if (typeof window === 'undefined') return;
    
    try {
      const cache: CachedLocation = {
        latitude,
        longitude,
        accuracy,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to cache location:', error);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        setState({
          latitude,
          longitude,
          accuracy,
          error: null,
          loading: false,
          permission: 'granted',
        });

        // Cache the location
        cacheLocation(latitude, longitude, accuracy);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            setState((prev) => ({
              ...prev,
              error: errorMessage,
              loading: false,
              permission: 'denied',
            }));
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            setState((prev) => ({
              ...prev,
              error: errorMessage,
              loading: false,
            }));
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            setState((prev) => ({
              ...prev,
              error: errorMessage,
              loading: false,
            }));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Accept cached position up to 1 minute old
      }
    );
  };

  return {
    ...state,
    requestLocation,
  };
}
