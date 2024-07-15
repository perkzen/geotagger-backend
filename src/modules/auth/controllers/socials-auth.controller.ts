import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { AuthUserDto } from '@app/modules/auth/dtos/auth-user.dto';
import { SocialAuthProviderGuard } from '@app/modules/auth/guards/social-auth-provider.guard';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { UserDto } from '@app/modules/users/dtos/user.dto';
import { Public } from '../decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class SocialsAuthController {
  constructor(private readonly authService: AuthService) {}

  @Get(':provider')
  @Public()
  @UseGuards(SocialAuthProviderGuard)
  handleSocialLogin() {}

  @Public()
  @Get(':provider/callback')
  @UseGuards(SocialAuthProviderGuard)
  async handleLoginCallback(@Req() req: Request) {
    const user = req.user as UserDto;
    const dto = await this.authService.login(user);
    return serializeToDto(AuthUserDto, dto);
  }
}
