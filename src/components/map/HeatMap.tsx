'use client';

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_STYLE_URL } from '@/lib/constants';
import { generateCircle } from '@/lib/geo';
import type { Hotspot } from '@/types/database';

export interface HeatMapHandle {
  flyTo: (lng: number, lat: number, zoom?: number) => void;
}

interface HeatMapProps {
  hotspots?: Hotspot[];
  /** If true, show a draggable marker and call onLocationSelect */
  pickMode?: boolean;
  initialCenter?: [number, number];
  initialZoom?: number;
  onLocationSelect?: (lng: number, lat: number) => void;
  onHotspotClick?: (hotspot: Hotspot) => void;
  /** Show a translucent circle on the map for volunteer radius */
  radiusCircle?: { lng: number; lat: number; radiusKm: number };
  className?: string;
}

const HeatMap = forwardRef<HeatMapHandle, HeatMapProps>(function HeatMap({
  hotspots = [],
  pickMode = false,
  initialCenter,
  initialZoom,
  onLocationSelect,
  onHotspotClick,
  radiusCircle,
  className = '',
}, ref) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useImperativeHandle(ref, () => ({
    flyTo(lng: number, lat: number, zoom = 14) {
      mapRef.current?.flyTo({ center: [lng, lat], zoom, duration: 1500 });
    },
  }));

  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || '';

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    if (!maptilerKey) {
      console.error('[HeatMap] NEXT_PUBLIC_MAPTILER_KEY is not set — map will not render');
    }

    const container = mapContainer.current;
    const styleUrl = MAP_STYLE_URL + maptilerKey;

    const map = new maplibregl.Map({
      container,
      style: styleUrl,
      center: initialCenter || DEFAULT_CENTER,
      zoom: initialZoom ?? DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      'top-right'
    );
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      map.resize();
      setMapLoaded(true);
    });

    map.on('error', (e) => {
      console.error('[HeatMap] MapLibre error:', e.error?.message || e);
    });

    // MapLibre captures the container size at construction time. If the
    // container is still being laid out by CSS (e.g. absolute positioning
    // hasn't resolved yet), it records stale dimensions and never requests
    // tiles. A ResizeObserver catches the moment the container reaches its
    // true size and forces a re-read.
    const ro = new ResizeObserver(() => {
      if (map && !map._removed) {
        map.resize();
      }
    });
    ro.observe(container);

    mapRef.current = map;

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add heatmap layer when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || pickMode) return;

    // Build GeoJSON from hotspots
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: hotspots.map((h) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [h.centroid_longitude, h.centroid_latitude],
        },
        properties: {
          id: h.id,
          score: h.score,
          status: h.status,
          report_count: h.report_count,
          volunteer_interest_count: h.volunteer_interest_count,
          area_name: h.area_name,
        },
      })),
    };

    // Remove existing source/layers
    if (map.getLayer('hotspot-heat')) map.removeLayer('hotspot-heat');
    if (map.getLayer('hotspot-point')) map.removeLayer('hotspot-point');
    if (map.getSource('hotspots')) map.removeSource('hotspots');

    map.addSource('hotspots', { type: 'geojson', data: geojson });

    // Heatmap layer
    map.addLayer({
      id: 'hotspot-heat',
      type: 'heatmap',
      source: 'hotspots',
      maxzoom: 15,
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'score'], 0, 0, 20, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.1, 'rgba(254,240,217,0.4)',
          0.3, 'rgba(253,204,138,0.6)',
          0.5, 'rgba(252,141,89,0.7)',
          0.7, 'rgba(227,74,51,0.8)',
          1, 'rgba(179,0,0,0.9)',
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 8, 10, 25, 15, 40],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 13, 1, 16, 0.3],
      },
    });

    // Circle layer for close zoom
    map.addLayer({
      id: 'hotspot-point',
      type: 'circle',
      source: 'hotspots',
      minzoom: 12,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['get', 'score'], 2, 8, 20, 20],
        'circle-color': [
          'match',
          ['get', 'status'],
          'cleaned', '#4AA853',
          'recently_improved', '#3b82f6',
          'cleanup_forming', '#C67B4E',
          '#B06A3B', // needs_attention default
        ],
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });

    // Click handler for hotspot circles
    map.on('click', 'hotspot-point', (e) => {
      if (e.features && e.features[0] && onHotspotClick) {
        const props = e.features[0].properties;
        const hotspot = hotspots.find((h) => h.id === props?.id);
        if (hotspot) onHotspotClick(hotspot);
      }
    });

    map.on('mouseenter', 'hotspot-point', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'hotspot-point', () => {
      map.getCanvas().style.cursor = '';
    });
  }, [hotspots, mapLoaded, pickMode, onHotspotClick]);

  // Pick mode — draggable marker
  const handleMapClick = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      if (!pickMode || !mapRef.current) return;
      const { lng, lat } = e.lngLat;

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new maplibregl.Marker({ draggable: true, color: '#4AA853' })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        markerRef.current.on('dragend', () => {
          const pos = markerRef.current?.getLngLat();
          if (pos && onLocationSelect) onLocationSelect(pos.lng, pos.lat);
        });
      }

      if (onLocationSelect) onLocationSelect(lng, lat);
    },
    [pickMode, onLocationSelect]
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (pickMode) {
      map.on('click', handleMapClick);
    }

    return () => {
      map.off('click', handleMapClick);
    };
  }, [pickMode, mapLoaded, handleMapClick]);

  // Set marker programmatically (e.g. from geolocation)
  useEffect(() => {
    if (!pickMode || !mapRef.current || !mapLoaded || !initialCenter) return;
    const [lng, lat] = initialCenter;

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      markerRef.current = new maplibregl.Marker({ draggable: true, color: '#4AA853' })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      markerRef.current.on('dragend', () => {
        const pos = markerRef.current?.getLngLat();
        if (pos && onLocationSelect) onLocationSelect(pos.lng, pos.lat);
      });
    }

    mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCenter, pickMode, mapLoaded]);

  // Radius circle overlay
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (!radiusCircle) {
      // Clean up if removed
      if (map.getLayer('radius-fill')) map.removeLayer('radius-fill');
      if (map.getLayer('radius-outline')) map.removeLayer('radius-outline');
      if (map.getSource('radius-circle')) map.removeSource('radius-circle');
      return;
    }

    const circleGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [generateCircle(radiusCircle.lng, radiusCircle.lat, radiusCircle.radiusKm)],
    };

    if (map.getSource('radius-circle')) {
      (map.getSource('radius-circle') as maplibregl.GeoJSONSource).setData(circleGeoJSON);
    } else {
      map.addSource('radius-circle', { type: 'geojson', data: circleGeoJSON });

      map.addLayer({
        id: 'radius-fill',
        type: 'fill',
        source: 'radius-circle',
        paint: {
          'fill-color': '#4AA853',
          'fill-opacity': 0.12,
        },
      });

      map.addLayer({
        id: 'radius-outline',
        type: 'line',
        source: 'radius-circle',
        paint: {
          'line-color': '#4AA853',
          'line-width': 2,
          'line-opacity': 0.6,
        },
      });
    }
  }, [radiusCircle, mapLoaded]);

  return (
    <div className={className || 'relative'} style={{ minHeight: 200 }}>
      {/* MapLibre forcibly sets position:relative on its container, so we cannot
          use absolute positioning on it. Use explicit width/height: 100% instead. */}
      <div
        ref={mapContainer}
        className="rounded-2xl overflow-hidden"
        style={{ width: '100%', height: '100%' }}
      />
      {pickMode && (
        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs font-medium text-weathered shadow-sm">
          Tap the map to set location, or drag the pin
        </div>
      )}
    </div>
  );
});

export default HeatMap;
