import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@app/modules/auth/decorators/role.decorator';
import { Role } from '@app/modules/auth/enums/role.enum';
import { UnauthorizedAccessException } from '@app/modules/auth/exceptions/unauthorized-access.exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      throw new UnauthorizedAccessException();
    }

    const { user } = context.switchToHttp().getRequest();

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new UnauthorizedAccessException();
    }

    return hasRole;
  }
}
