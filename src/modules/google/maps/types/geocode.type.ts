import { AddressDto } from '@app/modules/google/maps/dtos/address.dto';
import { CoordinatesDto } from '@app/modules/google/maps/dtos/coordinates.dto';

export type GeocodeOptions =
  | {
      type: 'address';
      data: { address: string };
    }
  | {
      type: 'coordinates';
      data: { lat: number; lng: number };
    };

export type GeocodeReturnType<T extends GeocodeOptions> = T['type'] extends 'address' ? CoordinatesDto : AddressDto;
