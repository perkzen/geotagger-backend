import { UserProfileDto } from '@app/modules/users/dtos/user-profile.dto';
import { TestAppBootstrap } from '@test/common/test-app-bootstrap';

export const getUserProfile = async (testingApp: TestAppBootstrap, accessToken: string) => {
  const res = await testingApp.httpServer.request().get('/profile').set('Authorization', `Bearer ${accessToken}`);
  return res.body as UserProfileDto;
};
