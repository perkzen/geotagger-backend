import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_TOKEN_COOKIE_NAME } from '@app/modules/auth/constants/auth.constants';
import { AuthStrategy } from '@app/modules/auth/enums/auth-strategy.enum';
import { JwtPayload, JwtUser } from '@app/modules/auth/types/jwt.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AuthStrategy.JWT) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken(), JwtStrategy.fromCookie]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  async validate({ sub }: JwtPayload): Promise<JwtUser> {
    return sub;
  }

  private static fromCookie(req: Request): string | null {
    if (
      req.cookies &&
      ACCESS_TOKEN_COOKIE_NAME in req.cookies &&
      typeof req.cookies[ACCESS_TOKEN_COOKIE_NAME] === 'string' &&
      req.cookies[ACCESS_TOKEN_COOKIE_NAME].length > 0
    ) {
      return req.cookies[ACCESS_TOKEN_COOKIE_NAME];
    }

    return null;
  }
}
