import { join } from 'path';
import { faker } from '@faker-js/faker';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { AWS_S3_CLIENT } from '@app/modules/aws/aws.constants';
import { AwsS3Service } from '@app/modules/aws/s3/aws-s3.service';
import { CreateLocationDto } from '@app/modules/locations/dtos/create-location.dto';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';
import { S3ClientMock } from '@test/mocks/s3-client.mock';
import { createUser, getAccessToken } from '@test/utils/auth';
import { createLocation } from '@test/utils/location';

describe('Locations (e2e)', () => {
  let testingApp: TestAppBootstrap;

  let accessToken: string;
  let otherAccessToken: string;

  const userDto: CreateLocalUserDto = {
    email: faker.internet.email(),
    password: 'Password123!',
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
  };

  const otherUserDto: CreateLocalUserDto = {
    email: faker.internet.email(),
    password: 'Password123!',
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
  };

  const imageFile = join(__dirname, '..', 'files', 'test.jpeg');
  const textFile = join(__dirname, '..', 'files', 'test.txt');
  const imageUrl = 'https://example.com/image.jpg';

  const location: CreateLocationDto = {
    address: 'address',
    lat: 51.5074,
    lng: 0.1278,
  };

  const createNewLocation = (token: string, file: string) => {
    return createLocation(testingApp, token, location, file);
  };

  beforeAll(async () => {
    testingApp = new TestAppBootstrap();
    await testingApp.compile({
      overrideFunc: (module) => module.overrideProvider(AWS_S3_CLIENT).useClass(S3ClientMock),
    });

    const authService = testingApp.app.get(AuthService);
    const awsS3Service = testingApp.app.get(AwsS3Service);

    jest.spyOn(awsS3Service, 'getObjectUrl').mockImplementation(async () => imageUrl);

    await createUser(authService, userDto);
    accessToken = await getAccessToken(authService, { email: userDto.email, password: userDto.password });

    await createUser(authService, otherUserDto);
    otherAccessToken = await getAccessToken(authService, {
      email: otherUserDto.email,
      password: otherUserDto.password,
    });
  });

  afterAll(async () => {
    await testingApp.close();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await testingApp.db.location.deleteMany();
  });

  it('should be defined', () => {
    expect(accessToken).toBeDefined();
    expect(otherAccessToken).toBeDefined();
  });

  describe('POST /locations', () => {
    it('should return 401 if user is not authenticated', async () => {
      await testingApp.httpServer.request().post('/locations').expect(401);
    });
    it('should create location', async () => {
      const res = await createNewLocation(accessToken, imageFile);

      expect(res.status).toBe(201);
      expect(res.body.imageUrl).toBe(imageUrl);
      expect(res.body.lat).toBe(location.lat);
      expect(res.body.lng).toBe(location.lng);
      expect(res.body.address).toBe(location.address);
    });
    it('should return 400 if image is not provided', async () => {
      const res = await testingApp.httpServer
        .request()
        .post('/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('address', location.address)
        .field('lat', location.lat)
        .field('lng', location.lng)
        .expect(400);

      expect(res.body.error).toBe('File is required');
    });
    it('should return 400 if invalid file type is provided', async () => {
      const res = await createNewLocation(accessToken, textFile);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed (expected type is .(png|jpeg|jpg))');
    });
  });

  describe('GET /locations/:id', () => {
    it('should return 401 if user is not authenticated', async () => {
      await testingApp.httpServer.request().get('/locations/1').expect(401);
    });
    it('should return 404 if location is not found', async () => {
      await testingApp.httpServer
        .request()
        .get('/locations/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toBe('Location with id 1 not found');
        });
    });
    it("should return 404 if location doesn't not exist", async () => {
      const res = await testingApp.httpServer
        .request()
        .get('/locations/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(res.body.error).toBe('Location with id 1 not found');
    });
    it('should return location', async () => {
      const res = await createNewLocation(accessToken, imageFile);

      const locationId = res.body.id;

      expect(locationId).toBeDefined();

      const locationRes = await testingApp.httpServer
        .request()
        .get(`/locations/${locationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(locationRes.body.imageUrl).toBe(imageUrl);
      expect(locationRes.body.lat).toBe(location.lat);
      expect(locationRes.body.lng).toBe(location.lng);
      expect(locationRes.body.address).toBe(location.address);
    });
  });

  describe('GET /locations', () => {
    it('should return 401 if user is not authenticated', async () => {
      await testingApp.httpServer.request().get('/locations').expect(401);
    });
    it('should return locations', async () => {
      await createNewLocation(accessToken, imageFile);

      const locationsRes = await testingApp.httpServer
        .request()
        .get('/locations?take=10&skip=0')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(locationsRes.body.data).toHaveLength(1);
      expect(locationsRes.body.data?.[0].imageUrl).toBe(imageUrl);
      expect(locationsRes.body.data?.[0].lat).toBe(location.lat);
      expect(locationsRes.body.data?.[0].lng).toBe(location.lng);
      expect(locationsRes.body.data?.[0].address).toBe(location.address);
      expect(locationsRes.body.meta.total).toBe(1);
      expect(locationsRes.body.meta.take).toBe(10);
      expect(locationsRes.body.meta.skip).toBe(0);
    });
  });
  describe('GET /locations/me', () => {
    it('should return 401 if user is not authenticated', async () => {
      await testingApp.httpServer.request().get('/locations/me').expect(401);
    });
    it('should return users locations', async () => {
      await createNewLocation(accessToken, imageFile);

      const locationsRes = await testingApp.httpServer
        .request()
        .get('/locations/me?take=10&skip=0')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(locationsRes.body.data).toHaveLength(1);
      expect(locationsRes.body.data?.[0].imageUrl).toBe(imageUrl);
      expect(locationsRes.body.data?.[0].lat).toBe(location.lat);
      expect(locationsRes.body.data?.[0].lng).toBe(location.lng);
      expect(locationsRes.body.data?.[0].address).toBe(location.address);
      expect(locationsRes.body.meta.total).toBe(1);
      expect(locationsRes.body.meta.take).toBe(10);
      expect(locationsRes.body.meta.skip).toBe(0);
    });
    it("should return empty array if user doesn't have locations", async () => {
      const locationsRes = await testingApp.httpServer
        .request()
        .get('/locations/me?take=10&skip=0')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(locationsRes.body.data).toHaveLength(0);
      expect(locationsRes.body.meta.total).toBe(0);
      expect(locationsRes.body.meta.take).toBe(10);
      expect(locationsRes.body.meta.skip).toBe(0);
    });
  });
  describe('DELETE /locations/:id', () => {
    it('should return 401 if user is not authenticated', async () => {
      await testingApp.httpServer.request().delete('/locations/1').expect(401);
    });
    it('should return 404 if location is not found', async () => {
      await testingApp.httpServer
        .request()
        .delete('/locations/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toBe('Location with id 1 not found');
        });
    });
    it('should return 403 if user is not owner of location', async () => {
      const res = await createNewLocation(otherAccessToken, imageFile);

      const locationId = res.body.id;

      expect(locationId).toBeDefined();

      await testingApp.httpServer
        .request()
        .delete(`/locations/${locationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.error).toBe('Cannot access the requested resource');
        });
    });
    it('should delete location', async () => {
      const res = await createNewLocation(accessToken, imageFile);

      const locationId = res.body.id;

      expect(locationId).toBeDefined();

      await testingApp.httpServer
        .request()
        .delete(`/locations/${locationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const locationRes = await testingApp.httpServer
        .request()
        .get(`/locations/${locationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(locationRes.body.error).toBe(`Location with id ${locationId} not found`);
    });
  });
  describe('PUT /locations/:id', () => {
    it('should return 401 if user is not authenticated', async () => {
      await testingApp.httpServer.request().put('/locations/1').expect(401);
    });
    it('should return 404 if location is not found', async () => {
      await testingApp.httpServer
        .request()
        .put('/locations/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('address', location.lng)
        .field('lat', location.lat)
        .field('lng', location.lng)
        .attach('image', join(__dirname, '..', 'files', 'test.jpeg'))
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toBe('Location with id 1 not found');
        });
    });
    it('should return 403 if user is not owner of location', async () => {
      const res = await createNewLocation(otherAccessToken, imageFile);
      const locationId = res.body.id;

      expect(locationId).toBeDefined();

      await testingApp.httpServer
        .request()
        .put(`/locations/${locationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .field('address', location.lng)
        .field('lat', location.lat)
        .field('lng', location.lng)
        .attach('image', join(__dirname, '..', 'files', 'test.jpeg'))
        .expect(403)
        .expect((res) => {
          expect(res.body.error).toBe('Cannot access the requested resource');
        });
    });
    it('should update location', async () => {
      const res = await createNewLocation(accessToken, imageFile);

      const locationId = res.body.id;

      expect(locationId).toBeDefined();

      const updatedRes = await testingApp.httpServer
        .request()
        .put(`/locations/${locationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .field('address', 'updated address')
        .field('lat', location.lat)
        .field('lng', location.lng);

      expect(updatedRes.status).toBe(200);
      expect(updatedRes.body.lat).toBe(location.lat);
      expect(updatedRes.body.lng).toBe(location.lng);
      expect(updatedRes.body.address).toBe('updated address');
      expect(updatedRes.body.imageUrl).toBe(imageUrl);
    });
  });
});
