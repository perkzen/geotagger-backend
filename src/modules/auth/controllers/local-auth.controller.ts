import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { LocalAuthGuard } from '@app/modules/auth/guards/local-auth.guard';
import { AuthService } from '@app/modules/auth/services/auth.service';
import { CreateUserDto } from '@app/modules/users/dtos/create-user.dto';
import { UserDto } from '@app/modules/users/dtos/user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class LocalAuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
    type: AuthUserDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: `test@mail.com`,
        },
        password: {
          type: 'string',
          example: `Password123!`,
        },
      },
    },
  })
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@User() user: UserDto) {
    const authUser = await this.authService.login(user);
    return serializeToDto(AuthUserDto, authUser);
  }

  @ApiOperation({ summary: 'Signup' })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: UserDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  @Public()
  @Post('register')
  async register(@Body() data: CreateUserDto) {
    const user = await this.authService.register(data);
    return serializeToDto(UserDto, user);
  }
}
