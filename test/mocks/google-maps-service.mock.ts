import { faker } from '@faker-js/faker';
import { DistanceDto } from '@app/modules/google/maps/dtos/distance.dto';

export class GoogleMapsServiceMock {
  async calculateDistance(
    origin: { lat: number; lng: number },
    destination: {
      lat: number;
      lng: number;
    },
  ) {
    const _origin = origin;
    const _destination = destination;

    return {
      destination: faker.location.streetAddress(),
      origin: faker.location.streetAddress(),
      distance: {
        text: '1 km',
        value: 1,
      },
    } as unknown as DistanceDto;
  }
}
