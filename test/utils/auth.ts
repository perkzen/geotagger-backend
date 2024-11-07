import { LoginDto } from '@app/modules/auth/dtos/login.dto';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { hashPassword } from '@app/modules/auth/utils/password.utils';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { UsersService } from '@app/modules/users/services/users.service';

export const getAccessTokens = async (authService: AuthService, { email, password }: LoginDto) => {
  const user = await authService.validateLocalUser(email, password);

  if (!user) {
    throw new Error('User not found');
  }

  return await authService.login(user);
};

export const getRefreshToken = async (authService: AuthService, { email, password }: LoginDto): Promise<string> => {
  const user = await authService.validateLocalUser(email, password);

  const data = await authService.login(user);

  return data.refreshToken;
};

export const createUser = async (
  userService: UsersService,
  { email, password, firstname, lastname }: CreateLocalUserDto,
) => {
  return await userService.createLocalUser({ email, password: await hashPassword(password), firstname, lastname });
};
