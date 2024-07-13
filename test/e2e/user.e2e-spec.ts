import { faker } from '@faker-js/faker';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';
import { createUser, getAccessToken } from '@test/utils/auth';

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
    await testingApp.compile();

    const authService = testingApp.app.get(AuthService);
    await createUser(authService, createUserDto);
    accessToken = await getAccessToken(authService, { email: createUserDto.email, password: createUserDto.password });
  });

  afterAll(async () => {
    await testingApp.close();
  });

  it('should be defined', () => {
    expect(accessToken).toBeDefined();
  });

  describe('PATCH /profile/change-password', () => {
    it('should return 401 if user is not authenticated', async () => {
      await testingApp.express
        .request()
        .patch('/profile/change-password')
        .send({
          newPassword: 'NewPassword123!',
          oldPassword: createUserDto.password,
        })
        .expect(401);
    });
    it('should change user password', async () => {
      await testingApp.express
        .request()
        .patch('/profile/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          newPassword: 'NewPassword123!',
          oldPassword: createUserDto.password,
        })
        .expect(200);
    });
  });
});
