import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from 'react';

interface Participant {
  id: string;
  display_name: string;
  latitude: number | null;
  longitude: number | null;
  is_host: boolean;
}

interface MapProps {
  participants: Participant[];
  destination?: { lat: number; lng: number } | null;
}

const Map = ({ participants, destination }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [apiKey, setApiKey] = useState<string>('');
  const [mapInitialized, setMapInitialized] = useState(false);

  const initializeMap = () => {
    if (!mapContainer.current || !apiKey) return;

    try {
      mapboxgl.accessToken = apiKey;
      
      const initialCenter: [number, number] = destination 
        ? [destination.lng, destination.lat]
        : [-74.5, 40];

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: initialCenter,
        zoom: 12,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      setMapInitialized(true);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    // Clear old markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Add destination marker
    if (destination) {
      const el = document.createElement('div');
      el.className = 'destination-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIxNSIgZmlsbD0iI0Y9N0M0QyIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMTUiIHI9IjgiIGZpbGw9IndoaXRlIi8+PC9zdmc+)';
      el.style.backgroundSize = 'cover';

      new mapboxgl.Marker(el)
        .setLngLat([destination.lng, destination.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<strong>Destination</strong>'))
        .addTo(map.current);
    }

    // Add participant markers
    const validParticipants = participants.filter(
      p => p.latitude !== null && p.longitude !== null
    );

    validParticipants.forEach((participant) => {
      const el = document.createElement('div');
      el.className = 'participant-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = participant.is_host ? '#9b87f5' : '#6E59A5';
      el.style.border = '3px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([participant.longitude!, participant.latitude!])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<strong>${participant.display_name}</strong>${participant.is_host ? ' (Host)' : ''}`
          )
        )
        .addTo(map.current!);

      markers.current[participant.id] = marker;
    });

    // Fit bounds to show all markers
    if (validParticipants.length > 0 || destination) {
      const bounds = new mapboxgl.LngLatBounds();

      validParticipants.forEach(p => {
        bounds.extend([p.longitude!, p.latitude!]);
      });

      if (destination) {
        bounds.extend([destination.lng, destination.lat]);
      }

      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
      });
    }
  }, [participants, destination, mapInitialized]);

  if (!apiKey) {
    return (
      <div className="aspect-video bg-secondary/30 rounded-xl flex items-center justify-center border-2 border-border p-8">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Mapbox API Key Required</h3>
            <p className="text-sm text-muted-foreground">
              Enter your Mapbox public token to display the map.
              Get yours at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mapbox-key">Mapbox Public Token</Label>
            <Input
              id="mapbox-key"
              type="text"
              placeholder="pk.ey..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <button
            onClick={initializeMap}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Initialize Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-border shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;
