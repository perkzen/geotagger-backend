import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Profile, Strategy } from 'passport-facebook';
import { VerifyCallback } from 'passport-google-oauth20';
import { AuthStrategy } from '@app/modules/auth/enums/auth-strategy.enum';
import { AuthService } from '@app/modules/auth/services/auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, AuthStrategy.FACEBOOK) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow('FACEBOOK_CLIENT_ID'),
      clientSecret: configService.getOrThrow('FACEBOOK_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('FACEBOOK_CALLBACK_URL'),
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'displayName', 'photos', 'email', 'first_name', 'last_name'],
      passReqToCallback: true,
    });
  }

  authenticate(req: Request, options?: object) {
    if (req.query && req.query.redirect) {
      const redirectUrl = req.query.redirect as string;

      options = {
        ...options,
        state: JSON.stringify({ redirectUrl }),
      };
    }

    super.authenticate(req, options);
  }

  async validate(req: Request, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
    const user = await this.authService.validateSocialUser({
      email: profile.emails[0].value,
      firstname: profile.name.givenName,
      lastname: profile.name.familyName,
      imageUrl: profile.photos[0].value,
      provider: AuthStrategy.FACEBOOK,
    });

    let redirectUrl: string | undefined;

    if (req.query && req.query.state) {
      const state = JSON.parse(req.query.state as string);
      redirectUrl = state.redirectUrl;
    }

    req.query.redirect = redirectUrl;

    done(null, user);
  }
}
