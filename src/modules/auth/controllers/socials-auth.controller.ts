import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { SocialAuthProviderGuard } from '@app/modules/auth/guards/social-auth-provider.guard';
import { AuthService } from '@app/modules/auth/services/auth.service';
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
  @ApiParam({
    name: 'redirect',
    required: true,
    description: 'The redirect URL',
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
  async handleLoginCallback(@Req() req: Request, @Res() res: Response, @Query('redirect') redirectUrl: string) {
    const user = req.user as UserDto;
    const { accessToken, refreshToken } = await this.authService.login(user);

    res.redirect(`${redirectUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  }
}
