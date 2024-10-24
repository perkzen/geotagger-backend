import { faker } from '@faker-js/faker';
import { DistanceDto } from '@app/modules/google/maps/dtos/distance.dto';
import { GeocodeOptions, GeocodeReturnType } from '@app/modules/google/maps/types/geocode.type';

export class GoogleMapsServiceMock {
  async calculateDistance(
    _origin: { lat: number; lng: number },
    _destination: {
      lat: number;
      lng: number;
    },
  ) {
    return {
      destination: faker.location.streetAddress(),
      origin: faker.location.streetAddress(),
      distance: {
        text: '1 km',
        value: 1,
      },
    } as unknown as DistanceDto;
  }

  async geocode<T extends GeocodeOptions>(options: T): Promise<GeocodeReturnType<T>> {
    if (options?.type === 'address') {
      return {
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
      } as unknown as GeocodeReturnType<T>;
    }

    return {
      address: faker.location.streetAddress(),
    } as unknown as GeocodeReturnType<T>;
  }
}
