import { faker } from '@faker-js/faker';
import { LoginDto } from '@app/modules/auth/dtos/login.dto';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';

describe('Auth (e2e)', () => {
  let testingApp: TestAppBootstrap;

  const createUserDto: CreateLocalUserDto = {
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
  });

  afterAll(async () => {
    await testingApp.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register successfully', async () => {
      const res = await testingApp.express.request().post('/auth/register').send(createUserDto);
      expect(res.status).toBe(201);
    });
    it('should fail because user is already registered', async () => {
      const res = await testingApp.express.request().post('/auth/register').send(createUserDto);
      expect(res.status).toBe(409);
    });
    it('should fail because password is too short', async () => {
      const res = await testingApp.express
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
      const res = await testingApp.express.request().post('/auth/login').send({ email: 'test', password: 'test' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
    it('should login successfully', async () => {
      const res = await testingApp.express.request().post('/auth/login').send(loginUserDto);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });
  });
});
