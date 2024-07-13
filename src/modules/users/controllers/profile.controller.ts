import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { JwtAuthGuard } from '@app/modules/auth/guards/jwt-auth.guard';
import { UpdatePasswordDto } from '@app/modules/users/dtos/update-password.dto';
import { UsersService } from '@app/modules/users/services/users.service';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(@User('userId') userId: string, @Body() dto: UpdatePasswordDto) {
    await this.usersService.updatePassword(userId, dto);
  }
}
