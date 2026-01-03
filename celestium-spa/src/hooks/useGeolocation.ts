import { useState } from 'react';

export interface GeoState {
    latitude: number | null;
    longitude: number | null;
    error: string | null;
    loading: boolean;
}

export function useGeolocation() {
    const [geo, setGeo] = useState<GeoState>({
        latitude: null,
        longitude: null,
        error: null,
        loading: false, // Don't load on mount, wait for user trigger
    });

    const requestLocation = () => {
        setGeo(prev => ({ ...prev, loading: true, error: null }));

        if (!navigator.geolocation) {
            setGeo(prev => ({ ...prev, loading: false, error: "Geolocation not supported" }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGeo({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                    loading: false
                });
            },
            (error) => {
                setGeo(prev => ({ ...prev, loading: false, error: error.message }));
            }
        );
    };

    return { ...geo, requestLocation };
}
