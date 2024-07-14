import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthStrategy } from '@app/modules/auth/enums/auth-strategy.enum';
import { comparePasswords } from '@app/modules/auth/utils/password.utils';
import { BucketPath } from '@app/modules/aws/s3/enums/bucket-path.enum';
import { MediaService } from '@app/modules/media/services/media.service';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { CreateSocialUserDto } from '@app/modules/users/dtos/create-social-user.dto';
import { UpdatePasswordDto } from '@app/modules/users/dtos/update-password.dto';
import { UserProfileDto } from '@app/modules/users/dtos/user-profile.dto';
import { CannotChangePasswordException } from '@app/modules/users/exceptions/cannot-change-password.exception';
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

  /**
   * User can only update their password if they are a local user,
   * because only local users have passwords.
   */
  async updatePassword(userId: string, { newPassword, oldPassword }: UpdatePasswordDto) {
    const user = await this.findById(userId);

    if (user.provider !== AuthStrategy.LOCAL) {
      throw new CannotChangePasswordException();
    }

    const isPasswordValid = await comparePasswords(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new CannotChangePasswordException();
    }

    await this.usersRepository.update(userId, { password: newPassword });
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.usersRepository.findOne(userId, { media: true });

    if (!user) {
      throw new UserNotFoundException();
    }

    return {
      ...user,
      imageUrl: user.media ? await this.mediaService.getMediaUrl(user.media.key) : null,
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
      await this.mediaService.uploadMedia(image, userId, BucketPath.PROFILE_IMAGES);
    }

    return this.getProfile(userId);
  }
}
