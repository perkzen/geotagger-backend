import { Body, Controller, Get, Patch, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { JwtAuthGuard } from '@app/modules/auth/guards/jwt-auth.guard';
import { UploadedImage } from '@app/modules/media/decorators/uploaded-image.decorator';
import { ImageDto } from '@app/modules/media/dtos/image.dto';
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
    const user = this.usersService.getProfile(userId);
    return serializeToDto(UserProfileDto, user);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(@User('userId') userId: string, @Body() dto: UpdatePasswordDto) {
    await this.usersService.updatePassword(userId, dto);
  }

  @Patch('image')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImageDto, required: false })
  async changeProfilePicture(@User('userId') userId: string, @UploadedImage(false) image?: Express.Multer.File) {
    const user = await this.usersService.updateProfileImage(userId, image);
    return serializeToDto(UserProfileDto, user);
  }
}
