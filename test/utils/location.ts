import { CreateLocationDto } from '@app/modules/locations/dtos/create-location.dto';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';

export const createLocation = (
  testingApp: TestAppBootstrap,
  token: string,
  location: CreateLocationDto,
  file: string,
) => {
  return testingApp.httpServer
    .request()
    .post('/locations')
    .set('Authorization', `Bearer ${token}`)
    .field('address', location.address)
    .field('lat', location.lat.toString())
    .field('lng', location.lng.toString())
    .attach('image', file);
};
