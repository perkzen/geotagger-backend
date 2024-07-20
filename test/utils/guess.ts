import { TestAppBootstrap } from '@test/common/test-app-bootstrap';

export const createGuess = (testingApp: TestAppBootstrap, token: string, locationId: string) => {
  return testingApp.httpServer
    .request()
    .post(`/locations/guess/${locationId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ lat: 51.5074, lng: 0.1278 });
};
