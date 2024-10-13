export type GeocodeOptions =
  | {
      type: 'address';
      data: { address: string };
    }
  | {
      type: 'coordinates';
      data: { lat: number; lng: number };
    };
