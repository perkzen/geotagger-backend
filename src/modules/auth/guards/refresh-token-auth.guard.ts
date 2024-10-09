import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategy } from '@app/modules/auth/enums/auth-strategy.enum';
import { InvalidRefreshTokenException } from '@app/modules/auth/exceptions/invalid-refresh-token.exception';
import { UserDto } from '@app/modules/users/dtos/user.dto';

@Injectable()
export class RefreshTokenAuthGuard extends AuthGuard(AuthStrategy.REFRESH_TOKEN) {
  constructor() {
    super();
  }

  handleRequest<T extends UserDto, _>(err: Error, user: T, _info: _) {
    if (err || !user) {
      throw err || new InvalidRefreshTokenException();
    }
    return user;
  }
}
