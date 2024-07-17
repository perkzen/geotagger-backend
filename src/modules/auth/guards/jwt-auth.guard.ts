import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@app/modules/auth/decorators/public.decorator';
import { AuthStrategy } from '@app/modules/auth/enums/auth-strategy.enum';
import { UnauthorizedAccessException } from '@app/modules/auth/exceptions/unauthorized-access.exception';
import { UserDto } from '@app/modules/users/dtos/user.dto';

@Injectable()
export class JwtAuthGuard extends AuthGuard(AuthStrategy.JWT) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest<T extends UserDto, _>(err: Error, user: T, _info: _) {
    if (err || !user) {
      throw err || new UnauthorizedAccessException();
    }
    return user;
  }
}
