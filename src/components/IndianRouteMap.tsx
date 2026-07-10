import React, { useState, useEffect } from 'react';
import { ArrowRight, Compass, Map as MapIcon, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

interface IndianRouteMapProps {
  pickupAddress?: string;
  dropAddress?: string;
  isAnimated?: boolean;
  onPickupChange?: (address: string) => void;
  onDropChange?: (address: string) => void;
}

// Custom DivIcons
const createCustomIcon = (color: string) => L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});
const pickupIcon = createCustomIcon('#18181B');
const dropIcon = createCustomIcon('#10B981');

function MapUpdater({ pCoords, dCoords }: { pCoords: [number, number] | null; dCoords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (pCoords && dCoords) {
      if (pCoords[0] === dCoords[0] && pCoords[1] === dCoords[1]) {
        map.flyTo(pCoords, 11, { animate: true, duration: 1.5 });
      } else {
        const bounds = L.latLngBounds([pCoords, dCoords]);
        map.flyToBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
      }
    } else if (pCoords) {
      map.flyTo(pCoords, 11, { animate: true, duration: 1.5 });
    } else if (dCoords) {
      map.flyTo(dCoords, 11, { animate: true, duration: 1.5 });
    }
  }, [pCoords, dCoords, map]);
  return null;
}

async function geocodeAddress(address: string): Promise<[number, number] | null> {
  if (!address.trim()) return null;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in&limit=1&email=admin@example.com`);
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (e) {
    console.error("Geocoding failed", e);
  }
  return null;
}

export function IndianRouteMap({
  pickupAddress: initialPickup = '',
  dropAddress: initialDrop = '',
  isAnimated = true,
  onPickupChange,
  onDropChange
}: IndianRouteMapProps) {
  const [pickAddr, setPickAddr] = useState(initialPickup);
  const [dropAddr, setDropAddr] = useState(initialDrop);
  
  const [pCoords, setPCoords] = useState<[number, number] | null>([28.6208, 77.3639]); // Default to Noida
  const [dCoords, setDCoords] = useState<[number, number] | null>([12.9121, 77.6446]); // Default to Bangalore
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [distance, setDistance] = useState<string>('Calculating...');

  useEffect(() => {
    if (initialPickup !== pickAddr) setPickAddr(initialPickup);
  }, [initialPickup]);

  useEffect(() => {
    if (initialDrop !== dropAddr) setDropAddr(initialDrop);
  }, [initialDrop]);

  // Initial geocode if props are provided
  useEffect(() => {
    let mounted = true;
    const fetchInitial = async () => {
      if (initialPickup || initialDrop) {
        setIsLoading(true);
        const p = initialPickup ? await geocodeAddress(initialPickup) : null;
        if (p) await new Promise(r => setTimeout(r, 1000)); // Rate limit delay
        const d = initialDrop ? await geocodeAddress(initialDrop) : null;
        
        if (mounted) {
          if (p) setPCoords(p);
          if (d) setDCoords(d);
          await updateRouteAndDistance(p || pCoords, d || dCoords);
          setIsLoading(false);
        }
      }
    };
    fetchInitial();
    return () => { mounted = false; };
  }, [initialPickup, initialDrop]);

  const updateRouteAndDistance = async (p: [number, number] | null, d: [number, number] | null) => {
    if (!p || !d) {
      setDistance('Unknown');
      setRouteCoords([]);
      return;
    }
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${p[1]},${p[0]};${d[1]},${d[0]}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("OSRM routing request failed");
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distKm = +(route.distance / 1000).toFixed(1);
        setDistance(`${distKm} km`);
        const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
        setRouteCoords(coords);
        return;
      }
    } catch (e) {
      console.error("OSRM failed, using Haversine fallback", e);
    }

    // Haversine fallback
    const R = 6371; // km
    const dLat = (d[0] - p[0]) * Math.PI / 180;
    const dLon = (d[1] - p[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(p[0] * Math.PI / 180) * Math.cos(d[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const dist = Math.round(R * c);
    setDistance(`${dist} km`);
    setRouteCoords([]);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    const p = await geocodeAddress(pickAddr);
    await new Promise(r => setTimeout(r, 1000)); // Rate limit delay
    const d = await geocodeAddress(dropAddr);
    
    if (p) setPCoords(p);
    if (d) setDCoords(d);
    await updateRouteAndDistance(p || pCoords, d || dCoords);
    setIsLoading(false);
    
    if (onPickupChange) onPickupChange(pickAddr);
    if (onDropChange) onDropChange(dropAddr);
  };

  // If this map is readonly (no change handlers), hide the left panel
  const isReadOnly = !onPickupChange && !onDropChange;

  return (
    <div className={`bg-white border border-zinc-200/80 rounded-2xl ${isReadOnly ? 'p-1' : 'p-5'} shadow-sm space-y-5`}>
      {!isReadOnly && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-zinc-900 text-white rounded-xl">
              <MapIcon size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Dynamic Route Map</h3>
              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Real-time Location Geocoding</p>
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100/60 shadow-sm">
              <Compass size={12} className="animate-spin" />
              <span>Locating...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/60 shadow-sm">
              <Compass size={12} className="animate-spin-slow" />
              <span>Live Map Enabled</span>
            </div>
          )}
        </div>
      )}

      <div className={`grid grid-cols-1 ${isReadOnly ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-6`}>
        {!isReadOnly && (
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3.5 space-y-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-zinc-900 rounded-full"></span>
                Pickup Address
              </span>
              <textarea
                value={pickAddr}
                onChange={e => setPickAddr(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSearch())}
                placeholder="e.g. Connaught Place, New Delhi"
                rows={2}
                className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-zinc-400 resize-none"
              />
            </div>

            <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3.5 space-y-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-zinc-900 rounded-full"></span>
                Dropoff Address
              </span>
              <textarea
                value={dropAddr}
                onChange={e => setDropAddr(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSearch())}
                placeholder="e.g. HSR Layout, Bengaluru"
                rows={2}
                className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-zinc-400 resize-none"
              />
            </div>
            
            <button 
              type="button"
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg py-2.5 text-xs font-bold transition-colors disabled:opacity-50"
            >
              <Search size={14} />
              {isLoading ? 'Geocoding...' : 'Search Route'}
            </button>

            <div className="bg-zinc-950 text-white p-4 rounded-xl border border-zinc-800 space-y-3.5">
              <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase block">Route Telemetry</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 block uppercase">Est. Distance</span>
                  <span className="text-base font-black text-emerald-400">{distance}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`${isReadOnly ? 'lg:col-span-1 border-0' : 'lg:col-span-8 border border-zinc-200'} rounded-2xl overflow-hidden relative z-0 h-[400px]`}>
          <MapContainer 
            center={[22.5937, 78.9629]} 
            zoom={5} 
            scrollWheelZoom={false} 
            className="w-full h-full absolute inset-0"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            <MapUpdater pCoords={pCoords} dCoords={dCoords} />

            {pCoords && <Marker position={pCoords} icon={pickupIcon} />}
            {dCoords && <Marker position={dCoords} icon={dropIcon} />}
            
            {pCoords && dCoords && (
              <Polyline 
                positions={routeCoords.length > 0 ? routeCoords : [pCoords, dCoords]} 
                color="#18181B" 
                weight={3} 
                dashArray={isAnimated ? "10, 15" : undefined}
                className={isAnimated ? "animate-route-flow" : ""}
              />
            )}
          </MapContainer>

          <div className="absolute bottom-4 left-4 flex gap-4 text-[10px] font-bold text-zinc-800 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-zinc-200 shadow-sm z-[1000]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-900"></span>
              <span>Pickup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Dropoff</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

