/**
 * Generate a GeoJSON polygon approximating a circle on the Earth's surface.
 * Uses a flat-Earth approximation which is accurate enough for radii < 50 km.
 */
export function generateCircle(
  centerLng: number,
  centerLat: number,
  radiusKm: number,
  points = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const earthRadiusKm = 6371;
  const latDelta = (radiusKm / earthRadiusKm) * (180 / Math.PI);
  const lngDelta =
    (radiusKm / earthRadiusKm) * (180 / Math.PI) /
    Math.cos((centerLat * Math.PI) / 180);

  const coordinates: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const lng = centerLng + lngDelta * Math.cos(angle);
    const lat = centerLat + latDelta * Math.sin(angle);
    coordinates.push([lng, lat]);
  }

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
    properties: {},
  };
}
