import { LoginDto } from '@app/modules/auth/dtos/login.dto';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';

export const getAccessTokens = async (authService: AuthService, { email, password }: LoginDto) => {
  const user = await authService.validateLocalUser(email, password);

  return await authService.login(user);
};

export const getRefreshToken = async (authService: AuthService, { email, password }: LoginDto): Promise<string> => {
  const user = await authService.validateLocalUser(email, password);

  const data = await authService.login(user);

  return data.refreshToken;
};

export const createUser = async (
  authService: AuthService,
  { email, password, firstname, lastname }: CreateLocalUserDto,
) => {
  return await authService.register({ email, password, firstname, lastname });
};
