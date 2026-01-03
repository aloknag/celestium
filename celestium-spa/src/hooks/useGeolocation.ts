import { useState, useCallback, useEffect } from 'react';

export interface GeoState {
    latitude: number | null;
    longitude: number | null;
    error: string | null;
    loading: boolean;
    permission: 'prompt' | 'granted' | 'denied';
}

export function useGeolocation() {
    const [geo, setGeo] = useState<GeoState>({
        latitude: null,
        longitude: null,
        error: null,
        loading: false, // Don't load on mount, wait for user trigger
        permission: 'prompt'
    });

    // Check permissions on mount for debugging
    useEffect(() => {
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then(result => {
                console.log("Initial Geo Permission:", result.state);
            });
        }
    }, []);

    const requestLocation = useCallback(() => {
        // If we already have data, don't ask again
        if (geo.latitude !== null && geo.longitude !== null) return;

        setGeo(prev => ({ ...prev, loading: true, error: null }));

        if (!navigator.geolocation) {
            setGeo(prev => ({ ...prev, loading: false, error: "Geolocation not supported", permission: 'denied' }));
            return;
        }

        // Safety Timeout: Force stop loading after 15s if browser hangs
        const safetyTimer = setTimeout(() => {
            setGeo(prev => {
                if (prev.loading) {
                    console.warn("Geolocation request timed out (Safety Timer).");
                    return { ...prev, loading: false, error: "Request timed out", permission: 'prompt' };
                }
                return prev;
            });
        }, 15000);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(safetyTimer);
                console.log("Geo Success:", position);
                setGeo({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                    loading: false,
                    permission: 'granted'
                });
            },
            (error) => {
                clearTimeout(safetyTimer);
                console.error(`Geo Error: Code ${error.code} - ${error.message}`);

                let permState: 'prompt' | 'granted' | 'denied' = 'prompt';

                // 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
                if (error.code === 1) {
                    permState = 'denied';
                } else {
                    // For timeout/unavailable, we don't automatically deny permission, 
                    // we just show the error.
                    console.warn("Location unavailable or timed out.");
                }

                setGeo(prev => ({
                    ...prev,
                    loading: false,
                    error: error.message,
                    permission: permState === 'denied' ? 'denied' : prev.permission
                }));
            },
            {
                enableHighAccuracy: false, // Fallback to WiFi/IP for speed/reliability
                timeout: 30000,
                maximumAge: 0
            }
        );
    }, [geo.latitude, geo.longitude]);

    const setManualLocation = useCallback((lat: number, lon: number) => {
        setGeo({
            latitude: lat,
            longitude: lon,
            error: null,
            loading: false,
            permission: 'granted'
        });
    }, []);

    return { ...geo, requestLocation, setManualLocation };
}
