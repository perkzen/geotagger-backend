import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { Public } from '@app/modules/auth/decorators/public.decorator';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { AuthTokensDto } from '@app/modules/auth/dtos/auth-tokens.dto';
import { ChangePasswordDto } from '@app/modules/auth/dtos/change-password.dto';
import { LoginDto } from '@app/modules/auth/dtos/login.dto';
import { RefreshTokenDto } from '@app/modules/auth/dtos/refresh-token.dto';
import { RequestResetPasswordDto } from '@app/modules/auth/dtos/request-reset-password.dto';
import { ResetPasswordDto } from '@app/modules/auth/dtos/reset-password.dto';
import { LocalAuthGuard } from '@app/modules/auth/guards/local-auth.guard';
import { RefreshTokenAuthGuard } from '@app/modules/auth/guards/refresh-token-auth.guard';
import { AuthService } from '@app/modules/auth/services/auth.service';
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
    type: AuthTokensDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@User() user: UserDto) {
    const tokens = await this.authService.login(user);
    return serializeToDto(AuthTokensDto, tokens);
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
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(@User('id') userId: string, @Body() dto: ChangePasswordDto) {
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

  @Public()
  @Post('refresh-token')
  @UseGuards(RefreshTokenAuthGuard)
  @ApiOperation({ summary: 'Refresh token' })
  @ApiBody({ type: RefreshTokenDto, description: 'You can send refresh token via body or cookie', required: false })
  async refreshToken(@User() user: UserDto) {
    const tokens = await this.authService.refreshAccessToken(user);
    return serializeToDto(AuthTokensDto, tokens);
  }

  @Get('session')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get user session information' })
  @ApiOkResponse({ type: UserDto })
  async getSession(@User() user: UserDto) {
    return serializeToDto(UserDto, user);
  }
}
