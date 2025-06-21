import React, { useState, useEffect } from 'react';
import { Button } from '@/shadcn/ui/button';
import { Alert, AlertDescription } from '@/shadcn/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

const GeolocationComponent: React.FC = () => {
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          setLocationPermission(true);
        }
      });
    }
  }, []);

  const requestLocationPermission = () => {
    if ('geolocation' in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission(true);
          setError(null);
          setIsLoading(false);
        },
        (err) => {
          setError(err.message);
          setLocationPermission(false);
          setIsLoading(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  };

  const getCoordinates = () => {
    if (locationPermission) {
      setIsLoading(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setIsLoading(false);
        },
        (err) => {
          setError(err.message);
          setCoordinates(null);
          setIsLoading(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    } else {
      setError('Location permission not granted');
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Button 
        onClick={requestLocationPermission}
        className="w-full"
        disabled={isLoading}
        variant={locationPermission ? "outline" : "default"}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Requesting Permission...
          </>
        ) : (
          locationPermission ? 'Permission Granted' : 'Request Location Permission'
        )}
      </Button>

      <Button 
        onClick={getCoordinates} 
        disabled={!locationPermission || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Getting Coordinates...
          </>
        ) : (
          'Get Coordinates'
        )}
      </Button>

      {coordinates && (
        <div className="bg-gray-100 p-4 rounded">
          <p>Latitude: {coordinates.latitude.toFixed(6)}</p>
          <p>Longitude: {coordinates.longitude.toFixed(6)}</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default GeolocationComponent;