import { Module } from '@nestjs/common';
import { UsersRepository } from '@app/modules/users/repositories/users.repository';
import { UsersService } from '@app/modules/users/services/users.service';

@Module({
  imports: [],
  providers: [UsersRepository, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
