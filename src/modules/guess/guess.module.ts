import { Module } from '@nestjs/common';
import { GoogleModule } from '@app/modules/google/google.module';
import { GuessRepository } from '@app/modules/guess/repositories/guess.repository';
import { LocationsModule } from '@app/modules/locations/locations.module';
import { MediaModule } from '@app/modules/media/media.module';
import { UsersModule } from '@app/modules/users/users.module';
import { GuessController } from './controllers/guess.controller';
import { GuessService } from './services/guess.service';

@Module({
  imports: [GoogleModule, LocationsModule, MediaModule, UsersModule],
  controllers: [GuessController],
  providers: [GuessService, GuessRepository],
})
export class GuessModule {}
