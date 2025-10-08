import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const map = useRef<L.Map | null>(null);
  const markers = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialCenter: [number, number] = destination 
      ? [destination.lat, destination.lng]
      : [40, -74.5];

    map.current = L.map(mapContainer.current).setView(initialCenter, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear old markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Add destination marker
    if (destination) {
      const destinationIcon = L.divIcon({
        className: 'custom-destination-marker',
        html: `<div style="width: 30px; height: 30px; background: #F97316; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.marker([destination.lat, destination.lng], { icon: destinationIcon })
        .addTo(map.current)
        .bindPopup('<strong>Destination</strong>');
    }

    // Add participant markers
    const validParticipants = participants.filter(
      p => p.latitude !== null && p.longitude !== null
    );

    validParticipants.forEach((participant) => {
      const color = participant.is_host ? '#9b87f5' : '#6E59A5';
      const participantIcon = L.divIcon({
        className: 'custom-participant-marker',
        html: `<div style="width: 24px; height: 24px; background: ${color}; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([participant.latitude!, participant.longitude!], { 
        icon: participantIcon 
      })
        .addTo(map.current!)
        .bindPopup(`<strong>${participant.display_name}</strong>${participant.is_host ? ' (Host)' : ''}`);

      markers.current[participant.id] = marker;
    });

    // Fit bounds to show all markers
    if (validParticipants.length > 0 || destination) {
      const bounds = L.latLngBounds([]);

      validParticipants.forEach(p => {
        bounds.extend([p.latitude!, p.longitude!]);
      });

      if (destination) {
        bounds.extend([destination.lat, destination.lng]);
      }

      map.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
      });
    }
  }, [participants, destination]);

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-border shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;
