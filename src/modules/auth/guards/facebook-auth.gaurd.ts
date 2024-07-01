import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategy } from '@app/modules/auth/enums/auth-strategy.enum';

@Injectable()
export class FacebookAuthGuard extends AuthGuard(AuthStrategy.FACEBOOK) {}
