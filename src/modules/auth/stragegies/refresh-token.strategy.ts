import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { REFRESH_TOKEN_COOKIE_NAME } from '@app/modules/auth/constants/auth.constants';
import { AuthStrategy } from '@app/modules/auth/enums/auth-strategy.enum';
import { JwtPayload, JwtUser } from '@app/modules/auth/types/jwt.types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, AuthStrategy.REFRESH_TOKEN) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromBodyField('refreshToken'),
        RefreshTokenStrategy.fromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  async validate({ sub }: JwtPayload): Promise<JwtUser> {
    return sub;
  }

  private static fromCookie(req: Request): string | null {
    if (req.cookies && REFRESH_TOKEN_COOKIE_NAME in req.cookies && req.cookies[REFRESH_TOKEN_COOKIE_NAME].length > 0) {
      return req.cookies[REFRESH_TOKEN_COOKIE_NAME];
    }

    return null;
  }
}
