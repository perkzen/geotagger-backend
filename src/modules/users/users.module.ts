import { Module } from '@nestjs/common';
import { ProfileController } from '@app/modules/users/controllers/profile.controller';
import { UsersRepository } from '@app/modules/users/repositories/users.repository';
import { UsersService } from '@app/modules/users/services/users.service';

@Module({
  imports: [],
  controllers: [ProfileController],
  providers: [UsersRepository, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
