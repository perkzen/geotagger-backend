import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { ACCESS_TOKEN_COOKIE_NAME } from '@app/modules/auth/constants/auth.constants';
import { Public } from '@app/modules/auth/decorators/public.decorator';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { AuthUserDto } from '@app/modules/auth/dtos/auth-user.dto';
import { LoginDto } from '@app/modules/auth/dtos/login.dto';
import { RequestResetPasswordDto } from '@app/modules/auth/dtos/request-reset-password.dto';
import { ResetPasswordDto } from '@app/modules/auth/dtos/reset-password.dto';
import { UpdatePasswordDto } from '@app/modules/auth/dtos/update-password.dto';
import { LocalAuthGuard } from '@app/modules/auth/guards/local-auth.guard';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { cookieOptions } from '@app/modules/auth/utils/cookie.utils';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { UserDto } from '@app/modules/users/dtos/user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class LocalAuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
    type: AuthUserDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@User() user: UserDto) {
    const authUser = await this.authService.login(user);
    return serializeToDto(AuthUserDto, authUser);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Signup' })
  @ApiBody({ type: CreateLocalUserDto })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: UserDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  async register(@Body() data: CreateLocalUserDto) {
    const user = await this.authService.register(data);
    return serializeToDto(UserDto, user);
  }

  @Patch('change-password')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: UpdatePasswordDto })
  async changePassword(@User('id') userId: string, @Body() dto: UpdatePasswordDto) {
    await this.authService.changePassword(userId, dto);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Sends reset password email' })
  @ApiBody({ type: RequestResetPasswordDto })
  @ApiCreatedResponse({ description: 'Password reset link sent successfully' })
  async requestResetPassword(@Body() data: RequestResetPasswordDto) {
    await this.authService.requestResetPassword(data.email);
  }

  @Public()
  @Post('reset-password/:token')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiCreatedResponse({ description: 'Password reset successfully' })
  async resetPassword(@Body() { password }: ResetPasswordDto, @Param('token') token: string) {
    await this.authService.resetPassword(token, password);
  }

  /**
   *  This method is used to logout the user by clearing the access token cookie.
   */
  @Post('logout')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Logout' })
  @ApiCreatedResponse({ description: 'User logged out successfully' })
  async logout(@Res() res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, cookieOptions);
    res.sendStatus(HttpStatus.OK);
  }
}
