import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapSelectorProps {
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
}

const MapSelector = ({ onLocationSelect }: MapSelectorProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([40, -74.5]);

  useEffect(() => {
    // Get user's current location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log("Could not get location, using default", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView(userLocation, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Create custom destination icon
    const destinationIcon = L.divIcon({
      className: 'custom-destination-marker',
      html: `<div style="width: 40px; height: 40px; background: linear-gradient(135deg, hsl(186, 85%, 45%), hsl(186, 95%, 60%)); border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    // Add click handler
    map.current.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Remove old marker
      if (marker.current) {
        marker.current.remove();
      }

      // Add new marker
      marker.current = L.marker([lat, lng], { icon: destinationIcon })
        .addTo(map.current!)
        .bindPopup('<strong>Destination</strong><br>Click "Create Session" to confirm')
        .openPopup();

      // Notify parent
      onLocationSelect({ lat, lng });
    });

    // Add user location marker if available
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div style="width: 24px; height: 24px; background: hsl(25, 95%, 60%); border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker(userLocation, { icon: userIcon })
        .addTo(map.current!)
        .bindPopup('Your current location');
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [userLocation]);

  return (
    <div className="relative w-full h-96">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
        <div className="bg-card/95 backdrop-blur-sm border-2 border-primary/30 rounded-xl p-4 shadow-lg">
          <p className="text-sm font-medium text-center">
            <span className="text-primary">Click anywhere on the map</span> to set your destination
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapSelector;
