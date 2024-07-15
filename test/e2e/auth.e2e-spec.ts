import { faker } from '@faker-js/faker';
import { LoginDto } from '@app/modules/auth/dtos/login.dto';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';
import { createUser, getAccessToken } from '@test/utils/auth';

describe('Auth (e2e)', () => {
  let testingApp: TestAppBootstrap;

  let accessToken: string;

  const createUserDto: CreateLocalUserDto = {
    email: faker.internet.email(),
    password: 'Password123!',
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
  };

  const accessTokenUser: CreateLocalUserDto = {
    email: faker.internet.email(),
    password: 'Password123!',
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
  };

  const loginUserDto: LoginDto = {
    email: createUserDto.email,
    password: createUserDto.password,
  };

  beforeAll(async () => {
    testingApp = new TestAppBootstrap();
    await testingApp.compile();

    const authService = testingApp.app.get(AuthService);

    await createUser(authService, accessTokenUser);
    accessToken = await getAccessToken(authService, {
      email: accessTokenUser.email,
      password: accessTokenUser.password,
    });
  });

  afterAll(async () => {
    await testingApp.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register successfully', async () => {
      const res = await testingApp.httpServer.request().post('/auth/register').send(createUserDto);
      expect(res.status).toBe(201);
    });
    it('should fail because user is already registered', async () => {
      const res = await testingApp.httpServer.request().post('/auth/register').send(createUserDto);
      expect(res.status).toBe(409);
    });
    it('should fail because password is too short', async () => {
      const res = await testingApp.httpServer
        .request()
        .post('/auth/register')
        .send({
          ...createUserDto,
          password: 'pass',
          email: 'test',
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toStrictEqual(['email must be an email', 'password is not strong enough']);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should fail because user is not registered', async () => {
      const res = await testingApp.httpServer.request().post('/auth/login').send({ email: 'test', password: 'test' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
    it('should login successfully', async () => {
      const res = await testingApp.httpServer.request().post('/auth/login').send(loginUserDto);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });
  });

  describe('PATCH /profile/password', () => {
    it('should return 401 if user is not authenticated', async () => {
      await testingApp.httpServer
        .request()
        .patch('/auth/change-password')
        .send({
          newPassword: 'NewPassword123!',
          oldPassword: createUserDto.password,
        })
        .expect(401);
    });
    it('should change user password', async () => {
      await testingApp.httpServer
        .request()
        .patch('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          newPassword: 'NewPassword123!',
          oldPassword: createUserDto.password,
        })
        .expect(200);
    });
  });
});
