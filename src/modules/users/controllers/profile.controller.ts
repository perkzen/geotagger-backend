import { Body, Controller, Get, Patch, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { MediaInterceptor } from '@app/modules/media/interceptors/media.interceptor';
import { UpdateUserDto } from '@app/modules/users/dtos/update-user.dto';
import { UserProfileDto } from '@app/modules/users/dtos/user-profile.dto';
import { UsersService } from '@app/modules/users/services/users.service';

@ApiTags('Profile')
@ApiBearerAuth()
@ApiCookieAuth()
@UseInterceptors(MediaInterceptor)
@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiOkResponse({ type: UserProfileDto })
  async getProfile(@User('id') userId: string) {
    const user = await this.usersService.findById(userId, { media: true });
    return serializeToDto(UserProfileDto, user);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiOkResponse({ type: UserProfileDto })
  async updateProfile(@User('id') userId: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.updateProfile(userId, dto);
    return serializeToDto(UserProfileDto, user);
  }
}
