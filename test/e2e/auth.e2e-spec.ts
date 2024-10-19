import { faker } from '@faker-js/faker';
import { REFRESH_TOKEN_COOKIE_NAME } from '@app/modules/auth/constants/auth.constants';
import { LoginDto } from '@app/modules/auth/dtos/login.dto';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { EMAIL_CLIENT } from '@app/modules/email/utils/email.constants';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';
import { EmailClientMock } from '@test/mocks/email-client.mock';
import { createUser, getAccessTokens } from '@test/utils/auth';

describe('Auth (e2e)', () => {
  let testingApp: TestAppBootstrap;

  let accessToken: string;
  let refreshToken: string;
  let userId: string;

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

  const sendEmailSpy = jest.spyOn(EmailClientMock.prototype, 'sendEmail');

  beforeAll(async () => {
    testingApp = new TestAppBootstrap();
    await testingApp.compile({
      overrideFunc: (module) => module.overrideProvider(EMAIL_CLIENT).useClass(EmailClientMock),
    });

    const authService = testingApp.app.get(AuthService);

    const { id } = await createUser(authService, accessTokenUser);
    userId = id;

    const tokens = await getAccessTokens(authService, {
      email: accessTokenUser.email,
      password: accessTokenUser.password,
    });

    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
  });

  afterAll(async () => {
    await testingApp.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
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

  describe('POST /auth/login', () => {
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

  describe('PATCH /auth/change-password', () => {
    it('should return 401 if user is not authenticated', async () => {
      await testingApp.httpServer
        .request()
        .patch('/auth/change-password')
        .send({
          newPassword: 'NewPassword123!',
          currentPassword: createUserDto.password,
        })
        .expect(401);
    });
    it('should return 401 if invalid password', async () => {
      await testingApp.httpServer
        .request()
        .patch('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          newPassword: 'NewPassword123!',
          currentPassword: 'test',
        });
    });
    it('should change user password', async () => {
      await testingApp.httpServer
        .request()
        .patch('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          newPassword: 'NewPassword123!',
          currentPassword: createUserDto.password,
        })
        .expect(200);
    });
  });
  describe('POST /auth/reset-password', () => {
    it('should return status 400 if invalid email format', async () => {
      const res = await testingApp.httpServer.request().post('/auth/reset-password').send({ email: 'test' });
      expect(res.status).toBe(400);
    });
    it("should return status 201 if email doesn't exist", async () => {
      const res = await testingApp.httpServer
        .request()
        .post('/auth/reset-password')
        .send({ email: faker.internet.email() });

      expect(res.status).toBe(201);
      expect(sendEmailSpy).toHaveBeenCalledTimes(0);
    });
    it('should return status 201 and call sendEmail', async () => {
      const res = await testingApp.httpServer
        .request()
        .post('/auth/reset-password')
        .send({ email: accessTokenUser.email });

      expect(res.status).toBe(201);
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
    });
  });
  describe('POST /auth/reset-password/:token', () => {
    it('should return status 400 if invalid password', async () => {
      const res = await testingApp.httpServer
        .request()
        .post('/auth/reset-password/invalid-token')
        .send({ password: 'pass' });

      expect(res.status).toBe(400);
    });
    it('should return status 400 if invalid token', async () => {
      const res = await testingApp.httpServer
        .request()
        .post('/auth/reset-password/invalid-token')
        .send({ password: 'NewPassword123!' });

      expect(res.status).toBe(400);
    });
    it('should return status 201 and reset password', async () => {
      const res = await testingApp.httpServer
        .request()
        .post(`/auth/reset-password/${accessToken}`)
        .send({ password: 'NewPassword123!' });

      expect(res.status).toBe(201);
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('should return 401 if no refresh token is provided', async () => {
      const res = await testingApp.httpServer.request().post('/auth/refresh-token');
      expect(res.status).toBe(401);
    });
    it('should return 401 if send invalid refresh token via body', async () => {
      const res = await testingApp.httpServer.request().post('/auth/refresh-token').send({ refreshToken: 'invalid' });

      expect(res.status).toBe(401);
    });
    it('should return 200 if refresh token is valid', async () => {
      const res = await testingApp.httpServer.request().post('/auth/refresh-token').send({ refreshToken });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });
    it('should return 2001 if valid refresh token is send via cookie', async () => {
      const res = await testingApp.httpServer
        .request()
        .post('/auth/refresh-token')
        .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}`);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });
    it('should return 401 if refresh token is sent with wrong cookie name', async () => {
      const res = await testingApp.httpServer
        .request()
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /auth/session', () => {
    it('should return 401 if user is not authenticated', async () => {
      const res = await testingApp.httpServer.request().get('/auth/session');
      expect(res.status).toBe(401);
    });
    it('should return 200 if user is authenticated', async () => {
      const res = await testingApp.httpServer
        .request()
        .get('/auth/session')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: userId,
        email: accessTokenUser.email,
        role: 'user',
      });
    });
  });
});
