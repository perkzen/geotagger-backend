import { join } from 'path';
import { faker } from '@faker-js/faker';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { AWS_S3_CLIENT } from '@app/modules/aws/aws.constants';
import { AwsS3Service } from '@app/modules/aws/s3/aws-s3.service';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';
import { S3ClientMock } from '@test/mocks/s3-client.mock';
import { createUser, getAccessToken } from '@test/utils/auth';

describe('Locations (e2e)', () => {
  let testingApp: TestAppBootstrap;

  let accessToken: string;
  let otherAccessToken: string;

  const createUserDto: CreateLocalUserDto = {
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

  beforeAll(async () => {
    testingApp = new TestAppBootstrap();
    await testingApp.compile({
      overrideFunc: (module) => module.overrideProvider(AWS_S3_CLIENT).useClass(S3ClientMock),
    });

    const authService = testingApp.app.get(AuthService);
    const awsS3Service = testingApp.app.get(AwsS3Service);

    jest.spyOn(awsS3Service, 'getObjectUrl').mockImplementation(async () => 'https://example.com/image.jpg');

    await createUser(authService, createUserDto);
    accessToken = await getAccessToken(authService, { email: createUserDto.email, password: createUserDto.password });

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
  });

  describe('POST /locations', () => {
    it('should return 401 if user is not authenticated', async () => {
      await testingApp.httpServer.request().post('/locations').expect(401);
    });
    it('should create location', async () => {
      const res = await testingApp.httpServer
        .request()
        .post('/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('address', 'address')
        .field('lat', '51.5074')
        .field('lng', '0.1278')
        .attach('image', join(__dirname, '..', 'files', 'test.jpeg'))
        .expect(201);

      expect(res.body.imageUrl).toBe('https://example.com/image.jpg');
      expect(res.body.lat).toBe(51.5074);
      expect(res.body.lng).toBe(0.1278);
      expect(res.body.address).toBe('address');
    });
    it('should return 400 if image is not provided', async () => {
      const res = await testingApp.httpServer
        .request()
        .post('/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('address', 'address')
        .field('lat', '51.5074')
        .field('lng', '0.1278')
        .expect(400);

      expect(res.body.error).toBe('File is required');
    });
    it('should return 400 if invalid file type is provided', async () => {
      await testingApp.httpServer
        .request()
        .post('/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('address', 'address')
        .field('lat', '51.5074')
        .field('lng', '0.1278')
        .attach('image', join(__dirname, '..', 'files', 'test.txt'))
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe('Validation failed (expected type is .(png|jpeg|jpg))');
        });
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
      const res = await testingApp.httpServer
        .request()
        .post('/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('address', 'address')
        .field('lat', '51.5074')
        .field('lng', '0.1278')
        .attach('image', join(__dirname, '..', 'files', 'test.jpeg'))
        .expect(201);

      const locationId = res.body.id;

      expect(locationId).toBeDefined();

      const locationRes = await testingApp.httpServer
        .request()
        .get(`/locations/${locationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(locationRes.body.imageUrl).toBe('https://example.com/image.jpg');
      expect(locationRes.body.lat).toBe(51.5074);
      expect(locationRes.body.lng).toBe(0.1278);
      expect(locationRes.body.address).toBe('address');
    });
  });
  describe('GET /locations/me', () => {
    it('should return 401 if user is not authenticated', async () => {
      await testingApp.httpServer.request().get('/locations/me').expect(401);
    });
    it('should return users locations', async () => {
      await testingApp.httpServer
        .request()
        .post('/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('address', 'address')
        .field('lat', '51.5074')
        .field('lng', '0.1278')
        .attach('image', join(__dirname, '..', 'files', 'test.jpeg'))
        .expect(201);

      const locationsRes = await testingApp.httpServer
        .request()
        .get('/locations/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(locationsRes.body).toHaveLength(1);
      expect(locationsRes.body[0].imageUrl).toBe('https://example.com/image.jpg');
      expect(locationsRes.body[0].lat).toBe(51.5074);
      expect(locationsRes.body[0].lng).toBe(0.1278);
      expect(locationsRes.body[0].address).toBe('address');
    });
    it("should return empty array if user doesn't have locations", async () => {
      const locationsRes = await testingApp.httpServer
        .request()
        .get('/locations/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(locationsRes.body).toHaveLength(0);
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
      const res = await testingApp.httpServer
        .request()
        .post('/locations')
        .set('Authorization', `Bearer ${otherAccessToken}`)
        .field('address', 'address')
        .field('lat', '51.5074')
        .field('lng', '0.1278')
        .attach('image', join(__dirname, '..', 'files', 'test.jpeg'))
        .expect(201);

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
      const res = await testingApp.httpServer
        .request()
        .post('/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('address', 'address')
        .field('lat', '51.5074')
        .field('lng', '0.1278')
        .attach('image', join(__dirname, '..', 'files', 'test.jpeg'))
        .expect(201);

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
  describe('PATCH /locations/:id', () => {
    it('should return 401 if user is not authenticated', async () => {
      await testingApp.httpServer.request().patch('/locations/1').expect(401);
    });
    it('should return 404 if location is not found', async () => {
      await testingApp.httpServer
        .request()
        .patch('/locations/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('address', 'address2')
        .field('lat', '52.5074')
        .field('lng', '3.1278')
        .attach('image', join(__dirname, '..', 'files', 'test.jpeg'))
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toBe('Location with id 1 not found');
        });
    });
    it('should return 403 if user is not owner of location', async () => {
      const res = await testingApp.httpServer
        .request()
        .post('/locations')
        .set('Authorization', `Bearer ${otherAccessToken}`)
        .field('address', 'address')
        .field('lat', '51.5074')
        .field('lng', '0.1278')
        .attach('image', join(__dirname, '..', 'files', 'test.jpeg'))
        .expect(201);

      const locationId = res.body.id;

      expect(locationId).toBeDefined();

      await testingApp.httpServer
        .request()
        .patch(`/locations/${locationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .field('address', 'address')
        .field('lat', '51.5074')
        .field('lng', '0.1278')
        .attach('image', join(__dirname, '..', 'files', 'test.jpeg'))
        .expect(403)
        .expect((res) => {
          expect(res.body.error).toBe('Cannot access the requested resource');
        });
    });
    it('should update location', async () => {
      const res = await testingApp.httpServer
        .request()
        .post('/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('address', 'address')
        .field('lat', '51.5074')
        .field('lng', '0.1278')
        .attach('image', join(__dirname, '..', 'files', 'test.jpeg'))
        .expect(201);

      const locationId = res.body.id;

      expect(locationId).toBeDefined();

      const updatedRes = await testingApp.httpServer
        .request()
        .patch(`/locations/${locationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .field('address', 'updated address')
        .field('lat', '51.5074')
        .field('lng', '0.1278')
        .attach('image', join(__dirname, '..', 'files', 'test.jpeg'))
        .expect(200);

      expect(updatedRes.body.imageUrl).toBe('https://example.com/image.jpg');
      expect(updatedRes.body.lat).toBe(51.5074);
      expect(updatedRes.body.lng).toBe(0.1278);
      expect(updatedRes.body.address).toBe('updated address');
    });
  });
});
