import { join } from 'path';
import { faker } from '@faker-js/faker';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { AWS_S3_CLIENT } from '@app/modules/aws/aws.constants';
import { AwsS3Service } from '@app/modules/aws/s3/aws-s3.service';
import { GoogleMapsService } from '@app/modules/google/maps/google-maps.service';
import { CreateLocationDto } from '@app/modules/locations/dtos/create-location.dto';
import { POINTS_LOST_FIRST_GUESS, POINTS_PER_LOCATION_UPLOAD } from '@app/modules/users/constants/points.constants';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { UsersService } from '@app/modules/users/services/users.service';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';
import { GoogleMapsServiceMock } from '@test/mocks/google-maps-service.mock';
import { S3ClientMock } from '@test/mocks/s3-client.mock';
import { createUser, getAccessTokens } from '@test/utils/auth';
import { createGuess } from '@test/utils/guess';
import { createLocation } from '@test/utils/location';
import { getUserProfile } from '@test/utils/user';

describe('Guess (e2e)', () => {
  let testingApp: TestAppBootstrap;

  let accessToken: string;
  let otherAccessToken: string;

  const user: CreateLocalUserDto = {
    email: faker.internet.email(),
    password: 'Password123!',
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
  };

  const otherUser: CreateLocalUserDto = {
    email: faker.internet.email(),
    password: 'Password123!',
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
  };

  const location: CreateLocationDto = {
    address: 'address',
    lat: 51.5074,
    lng: 0.1278,
  };

  const imageFile = join(__dirname, '..', 'files', 'test.jpeg');
  const imageUrl = 'https://test.com/image.jpeg';

  const createNewLocation = (token: string) => {
    return createLocation(testingApp, token, location, imageFile);
  };

  beforeAll(async () => {
    testingApp = new TestAppBootstrap();
    await testingApp.compile({
      overrideFunc: (module) =>
        module
          .overrideProvider(GoogleMapsService)
          .useClass(GoogleMapsServiceMock)
          .overrideProvider(AWS_S3_CLIENT)
          .useClass(S3ClientMock),
    });

    const authService = testingApp.app.get(AuthService);
    const userService = testingApp.app.get(UsersService);
    const awsS3Service = testingApp.app.get(AwsS3Service);

    jest.spyOn(awsS3Service, 'getObjectUrl').mockImplementation(async () => imageUrl);

    await createUser(userService, user);
    accessToken = (await getAccessTokens(authService, { email: user.email, password: user.password })).accessToken;

    await createUser(userService, otherUser);
    otherAccessToken = (
      await getAccessTokens(authService, {
        email: otherUser.email,
        password: otherUser.password,
      })
    ).accessToken;
  });

  afterAll(async () => {
    await testingApp.close();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await testingApp.db.guess.deleteMany();
  });

  it('should be defined', () => {
    expect(accessToken).toBeDefined();
    expect(otherAccessToken).toBeDefined();
  });

  describe('POST /locations/guess/:locationId', () => {
    it('should return 401 if user is not authenticated', async () => {
      const response = await testingApp.httpServer.request().post(`/locations/guess/${faker.string.uuid()}`);
      expect(response.status).toBe(401);
    });
    it('should return 400 if location does not exist', async () => {
      const response = await testingApp.httpServer
        .request()
        .post(`/locations/guess/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.status).toBe(400);
    });
    it('should return 400 if location is guessed by the same user', async () => {
      const { body } = await createNewLocation(accessToken);
      const response = await testingApp.httpServer
        .request()
        .post(`/locations/guess/${body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ lat: 51.5074, lng: 0.1278 });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Cannot guess on your own location');
    });
    it('should return 201 if location is guessed successfully', async () => {
      const { body } = await createNewLocation(otherAccessToken);
      const response = await testingApp.httpServer
        .request()
        .post(`/locations/guess/${body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ lat: 51.5074, lng: 0.1278 });

      const user = await getUserProfile(testingApp, accessToken);
      expect(user.points).toBe(POINTS_PER_LOCATION_UPLOAD * 2 - POINTS_LOST_FIRST_GUESS);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.distance).toBeDefined();
      expect(response.body.distanceText).toBeDefined();
    });
  });
  describe('GET /locations/me/best-scores', () => {
    it('should return 401 if user is not authenticated', async () => {
      const response = await testingApp.httpServer.request().get('/locations/me/best-scores');
      expect(response.status).toBe(401);
    });
    it("should return empty array for user's best scores", async () => {
      const res = await testingApp.httpServer
        .request()
        .get('/locations/me/best-scores?take=10&skip=0')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toHaveLength(0);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBe(0);
    });
    it('should return user best scores', async () => {
      const { body } = await createNewLocation(otherAccessToken);
      await createGuess(testingApp, accessToken, body.id);

      const res = await testingApp.httpServer
        .request()
        .get('/locations/me/best-scores?take=10&skip=0')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].distance).toBeDefined();
      expect(res.body.data[0].location.id).toBeDefined();
      expect(res.body.data[0].location.media.keyUrl).toBeDefined();
      expect(res.body.meta).toBeDefined();
    });
  });
});
