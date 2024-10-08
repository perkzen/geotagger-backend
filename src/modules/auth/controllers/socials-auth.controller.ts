import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AUTH_COOKIE_NAME } from '@app/modules/auth/constants/auth.constants';
import { SocialAuthProviderGuard } from '@app/modules/auth/guards/social-auth-provider.guard';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { cookieOptions } from '@app/modules/auth/utils/cookie.utils';
import { UserDto } from '@app/modules/users/dtos/user.dto';
import { Public } from '../decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class SocialsAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get(':provider')
  @UseGuards(SocialAuthProviderGuard)
  @ApiParam({
    name: 'provider',
    required: true,
    enum: ['facebook', 'google'],
    description: 'The social login provider (facebook or google)',
  })
  @ApiOperation({ summary: 'Redirects to the social login provider' })
  handleSocialLogin() {}

  @Public()
  @Get(':provider/callback')
  @UseGuards(SocialAuthProviderGuard)
  @ApiParam({
    name: 'provider',
    required: true,
    enum: ['facebook', 'google'],
    description: 'The social login provider (facebook or google)',
  })
  @ApiOperation({ summary: 'Handles the social login provider callback' })
  async handleLoginCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as UserDto;
    const { accessToken } = await this.authService.login(user);

    const authCallbackUrl = this.configService.get('AUTH_CALLBACK_URL'); // http://localhost:3000

    res.cookie(AUTH_COOKIE_NAME, accessToken, cookieOptions);
    res.redirect(authCallbackUrl);
  }
}
