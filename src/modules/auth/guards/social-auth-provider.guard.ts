import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class SocialAuthProviderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const provider = request.params.provider;

    let guard: CanActivate;

    switch (provider) {
      case 'google':
        guard = new (AuthGuard('google'))();
        break;
      case 'facebook':
        guard = new (AuthGuard('facebook'))();
        break;
      default:
        throw new UnauthorizedException('Unsupported authentication provider');
    }

    return guard.canActivate(context);
  }
}
