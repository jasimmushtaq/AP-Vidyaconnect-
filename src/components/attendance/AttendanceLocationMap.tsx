// ============================================================================
// AP VIDYACONNECT — INTERACTIVE ATTENDANCE LOCATION MAP
// Leaflet OpenStreetMap integration with drag-marker, search & radius boundary
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Crosshair, MapPin, Loader2, Navigation } from 'lucide-react';

// Fix Leaflet default icon paths in bundled environments
const customIcon = L.divIcon({
  className: 'custom-map-pin',
  html: `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 14px; height: 14px; background: rgba(240, 116, 33, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 32px; height: 32px; background: #0E2350; border: 2.5px solid #F07421; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
        <div style="width: 10px; height: 10px; background: #FFFFFF; border-radius: 50%; transform: rotate(45deg);"></div>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

interface AttendanceLocationMapProps {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  locationName: string;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  className?: string;
}

export const AttendanceLocationMap: React.FC<AttendanceLocationMapProps> = ({
  latitude,
  longitude,
  radiusMeters,
  locationName,
  onLocationChange,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const validLat = isNaN(latitude) || latitude === 0 ? 17.686800 : latitude;
      const validLng = isNaN(longitude) || longitude === 0 ? 83.218500 : longitude;

      const map = L.map(mapContainerRef.current, {
        center: [validLat, validLng],
        zoom: 16,
        scrollWheelZoom: true,
        attributionControl: false
      });

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Create Draggable Marker
      const marker = L.marker([validLat, validLng], {
        icon: customIcon,
        draggable: true,
        title: locationName || 'Internship Attendance Point'
      }).addTo(map);

      // Create Radius Circle
      const circle = L.circle([validLat, validLng], {
        radius: radiusMeters || 100,
        color: '#F07421',
        weight: 2,
        fillColor: '#F07421',
        fillOpacity: 0.18,
        dashArray: '4, 6'
      }).addTo(map);

      // Drag event handler
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        circle.setLatLng(position);
        reverseGeocode(position.lat, position.lng);
      });

      // Map Click event handler
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        circle.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center & marker when coordinates or radius change from external controls
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !circleRef.current) return;

    const currentPos = markerRef.current.getLatLng();
    const latDiff = Math.abs(currentPos.lat - latitude);
    const lngDiff = Math.abs(currentPos.lng - longitude);

    if (latDiff > 0.00001 || lngDiff > 0.00001) {
      markerRef.current.setLatLng([latitude, longitude]);
      circleRef.current.setLatLng([latitude, longitude]);
      mapInstanceRef.current.setView([latitude, longitude], 16, { animate: true });
    }

    circleRef.current.setRadius(radiusMeters || 100);
  }, [latitude, longitude, radiusMeters]);

  // Reverse Geocoding via OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (res.ok) {
        const data = await res.json();
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        onLocationChange(lat, lng, address);
        return;
      }
    } catch (e) {
      console.warn('Reverse geocode error:', e);
    }
    onLocationChange(lat, lng);
  };

  // Search places via Nominatim
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowResultsDropdown(true);

    try {
      // Append Andhra Pradesh context if not explicitly included
      const q = searchQuery.toLowerCase().includes('andhra') || searchQuery.toLowerCase().includes('india')
        ? searchQuery
        : `${searchQuery}, Andhra Pradesh, India`;

      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      });

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data || []);
      }
    } catch (err) {
      console.warn('Location search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    if (!isNaN(lat) && !isNaN(lng)) {
      if (markerRef.current && circleRef.current && mapInstanceRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        circleRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], 17, { animate: true });
      }
      onLocationChange(lat, lng, result.display_name);
    }

    setShowResultsDropdown(false);
    setSearchQuery(result.display_name.split(',')[0]);
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-[#E3E6EB] shadow-sm bg-white ${className}`}>
      {/* Map Search Bar Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000] max-w-md">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl border border-gray-300/80 shadow-md p-1.5 focus-within:border-[#F07421] focus-within:ring-2 focus-within:ring-[#F07421]/30 transition-all">
            <Search className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
            <input
              type="text"
              placeholder="Search office, landmark or tech park in AP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2.5 py-1 text-xs bg-transparent border-none outline-none font-medium text-[#0E2350] placeholder:text-gray-400"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-[#F07421] animate-spin mr-2 shrink-0" />
            ) : (
              <button
                type="submit"
                className="px-3 py-1 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors shadow-2xs"
              >
                Find
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showResultsDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-gray-200 shadow-xl max-h-56 overflow-y-auto z-[1001] divide-y divide-gray-100">
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left p-2.5 text-xs hover:bg-[#EEF2FA] text-gray-700 hover:text-[#0E2350] transition-colors flex items-start gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#F07421] shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed font-medium">{res.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Map Hint Badge */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200/80 shadow-md text-[11px] font-bold text-[#0E2350] flex items-center gap-1.5 pointer-events-none">
        <Navigation className="w-3.5 h-3.5 text-[#F07421]" />
        <span>Click map or drag pin to adjust location</span>
      </div>

      {/* Radius Indicator Badge */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-[#0E2350]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#0E2350] shadow-md text-[11px] font-mono font-bold text-white flex items-center gap-1.5 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-[#F07421] animate-pulse" />
        <span>Radius: {radiusMeters}m Zone</span>
      </div>

      {/* The Leaflet DOM Container */}
      <div ref={mapContainerRef} className="w-full h-80 sm:h-96 z-0" />
    </div>
  );
};
