import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '@app/modules/users/dtos/create-user.dto';
import { CannotCreateUserException } from '@app/modules/users/exceptions/cannot-create-user.exception';
import { UserNotFoundException } from '@app/modules/users/exceptions/user-not-found.exception';
import { UsersRepository } from '@app/modules/users/repositories/users.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  create(data: CreateUserDto) {
    try {
      return this.usersRepository.create(data);
    } catch (error) {
      this.logger.error(error.message);
      throw new CannotCreateUserException();
    }
  }

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }
}
