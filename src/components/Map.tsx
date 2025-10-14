import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-polylinedecorator';

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
  const markers = useRef<{ [key: string]: L.Marker | L.Polyline }>({});
  const [routes, setRoutes] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialCenter: [number, number] = destination 
      ? [destination.lat, destination.lng]
      : [40, -74.5];

    map.current = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView(initialCenter, 13);

    // Vibrant map tiles with better contrast
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'ab',
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

  // Fetch route from OSRM
  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        return data.routes[0];
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
    return null;
  };

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
            width: 48px; 
            height: 48px; 
            background: linear-gradient(135deg, #EF4444, #DC2626);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 4px solid #FFF;
            box-shadow: 0 6px 16px rgba(239, 68, 68, 0.7), 0 0 0 6px rgba(239, 68, 68, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: bounce 2s infinite;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" style="transform: rotate(45deg);">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <style>
            @keyframes bounce {
              0%, 100% { transform: rotate(-45deg) translateY(0); }
              50% { transform: rotate(-45deg) translateY(-10px); }
            }
          </style>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48],
      });

      L.marker([destination.lat, destination.lng], { icon: destinationIcon })
        .addTo(map.current)
        .bindPopup('<div style="font-weight: bold; color: #EF4444; font-size: 16px;">🎯 Destination</div>');
    }

    // Add participant markers with modern design
    const validParticipants = participants.filter(
      p => p.latitude !== null && p.longitude !== null
    );

    validParticipants.forEach(async (participant) => {
      const color = participant.is_host ? '#3B82F6' : '#10B981';
      const participantIcon = L.divIcon({
        className: 'custom-participant-marker',
        html: `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
          ">
            <div style="
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, ${color}, ${color}dd);
              border-radius: 50%;
              border: 4px solid white;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 0 4px ${color}40;
              animation: pulse 2s infinite;
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 14px;
              height: 14px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.15); opacity: 0.8; }
            }
          </style>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([participant.latitude!, participant.longitude!], { 
        icon: participantIcon 
      })
        .addTo(map.current!)
        .bindPopup(`
          <div style="font-weight: bold; color: ${color}; font-size: 14px;">
            ${participant.is_host ? '👑 ' : '🏍️ '}${participant.display_name}
            ${participant.is_host ? ' (Host)' : ''}
          </div>
        `);

      markers.current[participant.id] = marker;

      // Fetch and draw navigation routes to destination
      if (destination) {
        const route = await fetchRoute(
          [participant.latitude!, participant.longitude!],
          [destination.lat, destination.lng]
        );

        if (route && route.geometry && route.geometry.coordinates) {
          // Convert GeoJSON coordinates to Leaflet LatLngs
          const routeCoords = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          
          const routeLine = L.polyline(routeCoords, {
            color: color,
            weight: 5,
            opacity: 0.8,
            lineJoin: 'round',
            lineCap: 'round',
            className: 'navigation-route'
          }).addTo(map.current!);

          // Add arrow decorators for direction
          const arrowHead = L.polylineDecorator(routeLine, {
            patterns: [
              {
                offset: 25,
                repeat: 100,
                symbol: L.Symbol.arrowHead({
                  pixelSize: 12,
                  polygon: false,
                  pathOptions: {
                    color: color,
                    weight: 3,
                    opacity: 0.9
                  }
                })
              }
            ]
          }).addTo(map.current!);

          markers.current[`route-${participant.id}`] = routeLine as any;
          markers.current[`arrow-${participant.id}`] = arrowHead as any;

          // Display distance and duration
          const distance = (route.distance / 1000).toFixed(1); // km
          const duration = Math.round(route.duration / 60); // minutes
          
          marker.bindPopup(`
            <div style="font-weight: bold; color: ${color}; font-size: 14px;">
              ${participant.is_host ? '👑 ' : '🏍️ '}${participant.display_name}
              ${participant.is_host ? ' (Host)' : ''}<br/>
              <span style="font-size: 12px; color: #666;">
                📍 ${distance} km • ⏱️ ${duration} min
              </span>
            </div>
          `);
        }
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

      if (bounds.isValid()) {
        map.current.fitBounds(bounds, {
          padding: [80, 80],
          maxZoom: 15,
          animate: true,
          duration: 1,
        });
      }
    }
  }, [participants, destination]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-primary/30 shadow-glow">
      <div ref={mapContainer} className="absolute inset-0" />
      {/* Map overlay controls */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#3B82F6] rounded-full animate-pulse"></div>
            <span className="text-foreground font-medium">Host</span>
          </div>
          <div className="w-px h-4 bg-border mx-2"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#10B981] rounded-full"></div>
            <span className="text-foreground font-medium">Riders</span>
          </div>
          <div className="w-px h-4 bg-border mx-2"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#EF4444] rounded-full"></div>
            <span className="text-foreground font-medium">Destination</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
