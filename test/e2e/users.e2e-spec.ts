import { faker } from '@faker-js/faker';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { AWS_S3_CLIENT } from '@app/modules/aws/aws.constants';
import { AwsS3Service } from '@app/modules/aws/s3/aws-s3.service';
import { POINTS_PER_LOCATION_UPLOAD } from '@app/modules/users/constants/points.constants';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { UsersService } from '@app/modules/users/services/users.service';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';
import { S3ClientMock } from '@test/mocks/s3-client.mock';
import { createUser, getAccessTokens } from '@test/utils/auth';

describe('User (e2e)', () => {
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
    const userService = testingApp.app.get(UsersService);
    const awsS3Service = testingApp.app.get(AwsS3Service);

    jest.spyOn(awsS3Service, 'getObjectUrl').mockImplementation(async () => 'https://example.com/image.jpg');

    await createUser(userService, createUserDto);
    accessToken = (
      await getAccessTokens(authService, {
        email: createUserDto.email,
        password: createUserDto.password,
      })
    ).accessToken;
  });

  afterAll(async () => {
    await testingApp.close();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(accessToken).toBeDefined();
  });

  describe('GET /profile', () => {
    it('should return 401 if user is not authenticated', async () => {
      await testingApp.httpServer.request().get('/profile').expect(401);
    });
    it('should return user profile', async () => {
      const res = await testingApp.httpServer
        .request()
        .get('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.imageUrl).toBe(null);
      expect(res.body.firstname).toBe(createUserDto.firstname);
      expect(res.body.lastname).toBe(createUserDto.lastname);
      expect(res.body.email).toBe(createUserDto.email);
      expect(res.body.points).toBe(POINTS_PER_LOCATION_UPLOAD);
    });
  });

  describe('PATCH /profile', () => {
    it('should return 401 if user is not authenticated', async () => {
      await testingApp.httpServer.request().patch('/profile').expect(401);
    });
    it('should return 400 for invalid email', async () => {
      await testingApp.httpServer
        .request()
        .patch('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toEqual(['email must be an email']);
        });
    });
    it('should return 400 for invalid firstname', async () => {
      await testingApp.httpServer
        .request()
        .patch('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstname: '',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toEqual(['firstname must be longer than or equal to 3 characters']);
        });
    });
    it('should return 400 for invalid lastname', async () => {
      await testingApp.httpServer
        .request()
        .patch('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          lastname: '',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toEqual(['lastname must be longer than or equal to 3 characters']);
        });
    });
    it('should update user profile', async () => {
      const newFirstname = faker.person.firstName();
      const newLastname = faker.person.lastName();
      const newEmail = faker.internet.email();

      const res = await testingApp.httpServer
        .request()
        .patch('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: newEmail,
          firstname: newFirstname,
          lastname: newLastname,
        })
        .expect(200);

      expect(res.body.imageUrl).toBe(null);
      expect(res.body.firstname).toBe(newFirstname);
      expect(res.body.lastname).toBe(newLastname);
      expect(res.body.email).toBe(newEmail);
      expect(res.body.points).toBe(POINTS_PER_LOCATION_UPLOAD);
    });
    it("should update user's email", async () => {
      const newEmail = faker.internet.email();

      const res = await testingApp.httpServer
        .request()
        .patch('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: newEmail,
        })
        .expect(200);

      expect(res.body.imageUrl).toBe(null);
      expect(res.body.firstname).toBe(res.body.firstname);
      expect(res.body.lastname).toBe(res.body.lastname);
      expect(res.body.email).toBe(newEmail);
      expect(res.body.points).toBe(POINTS_PER_LOCATION_UPLOAD);
    });
  });
});
