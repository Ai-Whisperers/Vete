import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface LocationPickerProps {
  onLocationChange: (location: string) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationChange }) => {
  const [location, setLocation] = useState('');
  const [markerPosition, setMarkerPosition] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setMarkerPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
    });
  }, []);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    setMarkerPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    onLocationChange(`${event.latLng.lat()}, ${event.latLng.lng()}`);
  };

  return (
    <LoadScript googleMapsApiKey="YOUR_API_KEY">
      <GoogleMap
        mapContainerStyle={{ height: '400px', width: '800px' }}
        center={markerPosition}
        zoom={15}
        onClick={handleMapClick}
      >
        <Marker position={markerPosition} />
      </GoogleMap>
    </LoadScript>
  );
};

export default LocationPicker;