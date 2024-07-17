import { Controller, Get, Patch, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { UploadedImage } from '@app/modules/media/decorators/uploaded-image.decorator';
import { ImageDto } from '@app/modules/media/dtos/image.dto';
import { UserProfileDto } from '@app/modules/users/dtos/user-profile.dto';
import { UsersService } from '@app/modules/users/services/users.service';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiOkResponse({ type: UserProfileDto })
  async getProfile(@User('userId') userId: string) {
    const user = this.usersService.getProfile(userId);
    return serializeToDto(UserProfileDto, user);
  }

  @Patch('image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImageDto, required: false })
  async changeProfilePicture(@User('userId') userId: string, @UploadedImage(false) image?: Express.Multer.File) {
    const user = await this.usersService.updateProfileImage(userId, image);
    return serializeToDto(UserProfileDto, user);
  }
}
