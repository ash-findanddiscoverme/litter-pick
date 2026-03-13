// Council data for litter pick coordination (currently Oxfordshire, expanding UK-wide)
// Each council has a bounding box for approximate boundary detection

export interface CouncilInfo {
  name: string;
  url: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

// Oxford City is checked first as it sits inside the surrounding districts
const OXFORDSHIRE_COUNCILS: CouncilInfo[] = [
  {
    name: 'Oxford City',
    url: 'https://www.oxclean.org.uk/',
    bounds: { minLat: 51.72, maxLat: 51.79, minLng: -1.30, maxLng: -1.19 },
  },
  {
    name: 'Cherwell',
    url: 'https://www.cherwell.gov.uk/info/195/street_cleansing/468/roads-and-street-cleaning-programme/2',
    bounds: { minLat: 51.79, maxLat: 52.18, minLng: -1.42, maxLng: -1.08 },
  },
  {
    name: 'West Oxfordshire',
    url: 'https://www.westoxon.gov.uk/environment/litter-street-cleaning-and-dog-fouling/',
    bounds: { minLat: 51.62, maxLat: 52.00, minLng: -1.78, maxLng: -1.30 },
  },
  {
    name: 'South Oxfordshire',
    url: 'https://www.southoxon.gov.uk/south-oxfordshire-district-council/littering-fly-tipping-and-dumping-waste/community-litter-picking-how-we-can-help/how-to-book-our-litter-picking-service/',
    bounds: { minLat: 51.47, maxLat: 51.72, minLng: -1.25, maxLng: -0.88 },
  },
  {
    name: 'Vale of White Horse',
    url: 'https://www.whitehorsedc.gov.uk/vale-of-white-horse-district-council/littering-fly-tipping-and-dumping-waste/community-litter-picking-how-we-can-help/',
    bounds: { minLat: 51.52, maxLat: 51.75, minLng: -1.58, maxLng: -1.20 },
  },
];

/**
 * Determine which Oxfordshire council a coordinate falls within.
 * Uses approximate bounding boxes — Oxford City is checked first
 * as it sits inside the surrounding districts.
 */
export function getCouncilForCoordinates(
  lat: number,
  lng: number
): CouncilInfo | null {
  for (const council of OXFORDSHIRE_COUNCILS) {
    const { minLat, maxLat, minLng, maxLng } = council.bounds;
    if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
      return council;
    }
  }
  return null;
}
