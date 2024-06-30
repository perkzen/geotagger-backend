import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JwtUser } from '@app/modules/auth/types/jwt.types';

export const User = createParamDecorator((data: keyof JwtUser, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;
  return data ? user?.[data] : user;
});
