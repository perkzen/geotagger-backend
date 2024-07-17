import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { BucketPath } from '@app/modules/aws/s3/enums/bucket-path.enum';
import { MediaService } from '@app/modules/media/services/media.service';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { CreateSocialUserDto } from '@app/modules/users/dtos/create-social-user.dto';
import { UserProfileDto } from '@app/modules/users/dtos/user-profile.dto';
import { CannotCreateUserException } from '@app/modules/users/exceptions/cannot-create-user.exception';
import { UserNotFoundException } from '@app/modules/users/exceptions/user-not-found.exception';
import { UsersRepository } from '@app/modules/users/repositories/users.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mediaService: MediaService,
  ) {}

  async createLocalUser(data: CreateLocalUserDto) {
    try {
      return this.usersRepository.create(data);
    } catch (error) {
      this.logger.error(error.message);
      throw new CannotCreateUserException();
    }
  }

  async createSocialUser(data: CreateSocialUserDto) {
    try {
      return this.usersRepository.create(data);
    } catch (error) {
      this.logger.error(error.message);
      throw new CannotCreateUserException();
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string) {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async updatePassword(userId: string, newPassword: string) {
    await this.usersRepository.update(userId, { password: newPassword });
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.usersRepository.findOne(userId, { media: true });

    if (!user) {
      throw new UserNotFoundException();
    }

    return {
      ...user,
      imageUrl: user.media ? await this.mediaService.getMediaUrl(user.media.key) : user.imageUrl,
    };
  }

  async updateProfileImage(userId: string, image?: Express.Multer.File): Promise<UserProfileDto> {
    const user = await this.usersRepository.findOne(userId, { media: true });

    if (!user) {
      throw new UserNotFoundException();
    }

    const oldMediaId = user.media?.id;

    if (oldMediaId) {
      await this.mediaService.deleteMedia(oldMediaId);
    }

    if (image) {
      const media = await this.mediaService.uploadMedia(image, BucketPath.PROFILE_IMAGES);
      await this.usersRepository.updateMedia(userId, media.id);
    }

    return this.getProfile(userId);
  }
}
