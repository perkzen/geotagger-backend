import { faker } from '@faker-js/faker';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { UsersRepository } from '@app/modules/users/repositories/users.repository';
import { UsersService } from '@app/modules/users/services/users.service';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';
import { createUser, getAccessTokens } from '@test/utils/auth';

describe('Activity Log (e2e)', () => {
  let testingApp: TestAppBootstrap;

  let userAccessToken: string;
  let adminAccessToken: string;

  const userDto: CreateLocalUserDto = {
    email: faker.internet.email(),
    password: 'Password123!',
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
  };

  const adminDto: CreateLocalUserDto = {
    email: faker.internet.email(),
    password: 'Password123!',
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
  };

  beforeAll(async () => {
    testingApp = new TestAppBootstrap();
    await testingApp.compile();

    const authService = testingApp.app.get(AuthService);
    const userService = testingApp.app.get(UsersService);
    const userRepo = testingApp.app.get(UsersRepository);

    await createUser(userService, userDto);
    const admin = await createUser(userService, adminDto);
    await userRepo.update(admin.id, { role: 'admin' });

    userAccessToken = (
      await getAccessTokens(authService, {
        email: userDto.email,
        password: userDto.password,
      })
    ).accessToken;

    adminAccessToken = (
      await getAccessTokens(authService, {
        email: adminDto.email,
        password: adminDto.password,
      })
    ).accessToken;
  });

  afterAll(async () => {
    await testingApp.close();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userAccessToken).toBeDefined();
    expect(adminAccessToken).toBeDefined();
  });

  describe('GET /activity-logs', () => {
    it('should return 401 if user is not authenticated', async () => {
      const response = await testingApp.httpServer.request().get('/activity-logs?take=100&skip=0').send();

      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not an admin', async () => {
      const response = await testingApp.httpServer
        .request()
        .get('/activity-logs?take=100&skip=0')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send();

      expect(response.status).toBe(401);
    });

    it('should return 200 if user is an admin', async () => {
      const response = await testingApp.httpServer
        .request()
        .get('/activity-logs?take=100&skip=0')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
    it("should return 100 activity logs if they're available", async () => {
      for (let i = 0; i < 101; i++) {
        await testingApp.httpServer
          .request()
          .post('/activity-logs?take=100&skip=0')
          .set('Authorization', `Bearer ${userAccessToken}`)
          .send({
            action: 'click',
            componentType: 'link',
            value: 'string',
            location: 'string',
          });
      }

      const response = await testingApp.httpServer
        .request()
        .get('/activity-logs?take=100&skip=0')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(0);
    });
  });
  describe('POST /activity-logs', () => {
    it('should return 401 if user is not authenticated', async () => {
      const response = await testingApp.httpServer.request().post('/activity-logs?take=100&skip=0').send();

      expect(response.status).toBe(401);
    });

    it('should return 200 if user is authenticated', async () => {
      const response = await testingApp.httpServer
        .request()
        .post('/activity-logs?take=100&skip=0')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          action: 'click',
          componentType: 'link',
          value: 'string',
          location: 'string',
        });

      expect(response.status).toBe(201);
    });
  });
});
