import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { AuthUserDto } from '@app/modules/auth/dtos/auth-user.dto';
import { FacebookAuthGuard } from '@app/modules/auth/guards/facebook-auth.gaurd';
import { GoogleAuthGuard } from '@app/modules/auth/guards/google-auth.guard';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { UserDto } from '@app/modules/users/dtos/user.dto';
import { Public } from '../decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class SocialsAuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  handleGoogleLogin() {}

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleCallback(@Req() req: Request) {
    const user = req.user as UserDto;
    const dto = await this.authService.login(user);
    return serializeToDto(AuthUserDto, dto);
  }

  @Get('facebook')
  @Public()
  @UseGuards(FacebookAuthGuard)
  handleFacebookLogin() {}

  @Public()
  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async handleFacebookCallback(@Req() req: Request) {
    const user = req.user as UserDto;
    const dto = await this.authService.login(user);
    return serializeToDto(AuthUserDto, dto);
  }
}
