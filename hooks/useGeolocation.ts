import { useState } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permission: 'granted' | 'denied' | 'prompt' | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    permission: null,
  });

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
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          permission: 'granted',
        });
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
        maximumAge: 0,
      }
    );
  };

  return {
    ...state,
    requestLocation,
  };
}
