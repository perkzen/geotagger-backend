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

  const createUserDto: CreateLocalUserDto = {
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
  });

  afterAll(async () => {
    await testingApp.close();
    jest.clearAllMocks();
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
});
