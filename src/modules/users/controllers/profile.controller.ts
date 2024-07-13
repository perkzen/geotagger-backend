import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { JwtAuthGuard } from '@app/modules/auth/guards/jwt-auth.guard';
import { UpdatePasswordDto } from '@app/modules/users/dtos/update-password.dto';
import { UserProfileDto } from '@app/modules/users/dtos/user-profile.dto';
import { UsersService } from '@app/modules/users/services/users.service';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiOkResponse({ type: UserProfileDto })
  async getProfile(@User('userId') userId: string) {
    const user = this.usersService.findById(userId);
    return serializeToDto(UserProfileDto, user);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(@User('userId') userId: string, @Body() dto: UpdatePasswordDto) {
    await this.usersService.updatePassword(userId, dto);
  }
}
