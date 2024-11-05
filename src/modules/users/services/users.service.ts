import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Prisma, User } from '@prisma/client';
import { MediaEventName } from '@app/modules/media/enums/media-event-name.enum';
import { MediaUploadedEvent } from '@app/modules/media/events/media-uploaded.event';
import { MediaService } from '@app/modules/media/services/media.service';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { CreateSocialUserDto } from '@app/modules/users/dtos/create-social-user.dto';
import { UpdateUserDto } from '@app/modules/users/dtos/update-user.dto';
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

  async findById(id: string, include?: Prisma.UserInclude) {
    const user = await this.usersRepository.findOne(id, include);

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async updatePassword(userId: string, newPassword: string) {
    await this.usersRepository.update(userId, { password: newPassword });
  }

  async updateProfile(userId: string, data: UpdateUserDto) {
    return this.usersRepository.update(userId, data);
  }

  @OnEvent(MediaEventName.PROFILE_IMAGE_UPLOADED)
  async updateProfileImage({ payload }: MediaUploadedEvent) {
    const { ownerId, key, mimeType, filename } = payload;

    await this.usersRepository.transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: {
          id: ownerId,
        },
        include: {
          media: true,
        },
      });

      const mediaId = user.media?.id;

      if (mediaId) {
        await this.mediaService.delete(mediaId, tx);
      }

      const newMedia = await this.mediaService.create({ key, mimeType, filename }, tx);

      await tx.user.update({
        where: {
          id: ownerId,
        },
        data: {
          mediaId: newMedia.id,
        },
      });
    });
  }
}
