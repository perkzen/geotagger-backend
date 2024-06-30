import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(arg: 'id' | 'email' = 'id') {
    super(`Cannot find user with the given ${arg}`);
  }
}
