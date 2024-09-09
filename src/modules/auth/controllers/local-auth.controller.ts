import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { Public } from '@app/modules/auth/decorators/public.decorator';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { AuthUserDto } from '@app/modules/auth/dtos/auth-user.dto';
import { LoginDto } from '@app/modules/auth/dtos/login.dto';
import { RequestResetPasswordDto } from '@app/modules/auth/dtos/request-reset-password.dto';
import { ResetPasswordDto } from '@app/modules/auth/dtos/reset-password.dto';
import { UpdatePasswordDto } from '@app/modules/auth/dtos/update-password.dto';
import { LocalAuthGuard } from '@app/modules/auth/guards/local-auth.guard';
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
  @ApiOperation({ summary: 'Change user password' })
  @ApiBearerAuth()
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
}
