import { Module } from '@nestjs/common';
import { MediaModule } from '@app/modules/media/media.module';
import { ProfileController } from '@app/modules/users/controllers/profile.controller';
import { UsersRepository } from '@app/modules/users/repositories/users.repository';
import { UsersService } from '@app/modules/users/services/users.service';

@Module({
  imports: [MediaModule],
  controllers: [ProfileController],
  providers: [UsersRepository, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
