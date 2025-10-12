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
  const routingControl = useRef<any>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialCenter: [number, number] = destination 
      ? [destination.lat, destination.lng]
      : [40, -74.5];

    map.current = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView(initialCenter, 12);

    // Modern dark map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map.current);

    // Add attribution control
    L.control.attribution({
      position: 'bottomright',
      prefix: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

    // Add destination marker with modern design
    if (destination) {
      const destinationIcon = L.divIcon({
        className: 'custom-destination-marker',
        html: `
          <div style="
            width: 40px; 
            height: 40px; 
            background: linear-gradient(135deg, #F97316, #EA580C);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 4px solid #FFF;
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.6), 0 0 0 4px rgba(249, 115, 22, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" style="transform: rotate(45deg);">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      L.marker([destination.lat, destination.lng], { icon: destinationIcon })
        .addTo(map.current)
        .bindPopup('<div style="font-weight: bold; color: #F97316;">🎯 Destination</div>');
    }

    // Add participant markers with modern design
    const validParticipants = participants.filter(
      p => p.latitude !== null && p.longitude !== null
    );

    validParticipants.forEach((participant) => {
      const color = participant.is_host ? '#0EA5E9' : '#10B981';
      const participantIcon = L.divIcon({
        className: 'custom-participant-marker',
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
          ">
            <div style="
              width: 32px;
              height: 32px;
              background: ${color};
              border-radius: 50%;
              border: 4px solid white;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 4px ${color}20;
              animation: pulse 2s infinite;
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 12px;
              height: 12px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          </style>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([participant.latitude!, participant.longitude!], { 
        icon: participantIcon 
      })
        .addTo(map.current!)
        .bindPopup(`
          <div style="font-weight: bold; color: ${color};">
            ${participant.is_host ? '👑 ' : '🏍️ '}${participant.display_name}
            ${participant.is_host ? ' (Host)' : ''}
          </div>
        `);

      markers.current[participant.id] = marker;

      // Draw routes to destination
      if (destination) {
        const routeLine = L.polyline(
          [
            [participant.latitude!, participant.longitude!],
            [destination.lat, destination.lng]
          ],
          {
            color: color,
            weight: 3,
            opacity: 0.6,
            dashArray: '10, 10',
            className: 'route-line'
          }
        ).addTo(map.current!);

        // Store route line for cleanup
        markers.current[`route-${participant.id}`] = routeLine as any;
      }
    });

    // Fit bounds to show all markers with animation
    if (validParticipants.length > 0 || destination) {
      const bounds = L.latLngBounds([]);

      validParticipants.forEach(p => {
        bounds.extend([p.latitude!, p.longitude!]);
      });

      if (destination) {
        bounds.extend([destination.lat, destination.lng]);
      }

      map.current.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom: 15,
        animate: true,
        duration: 1,
      });
    }
  }, [participants, destination]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-primary/30 shadow-glow">
      <div ref={mapContainer} className="absolute inset-0" />
      {/* Map overlay controls */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <span className="text-foreground font-medium">Host</span>
          </div>
          <div className="w-px h-4 bg-border mx-2"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <span className="text-foreground font-medium">Riders</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
