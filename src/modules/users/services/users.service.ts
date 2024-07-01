import { Injectable, Logger } from '@nestjs/common';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';
import { CreateSocialUserDto } from '@app/modules/users/dtos/create-social-user.dto';
import { CannotCreateUserException } from '@app/modules/users/exceptions/cannot-create-user.exception';
import { UsersRepository } from '@app/modules/users/repositories/users.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

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

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }
}
