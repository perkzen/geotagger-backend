import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { AuthStrategy } from '@app/modules/auth/enums/auth-strategy.enum';

@Injectable()
export class SocialAuthProviderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const provider = request.params.provider as AuthStrategy;

    let guard: CanActivate;

    switch (provider) {
      case AuthStrategy.GOOGLE:
        guard = new (AuthGuard('google'))();
        break;
      case AuthStrategy.FACEBOOK:
        guard = new (AuthGuard('facebook'))();
        break;
      default:
        throw new UnauthorizedException('Unsupported authentication provider');
    }

    return guard.canActivate(context);
  }
}
