import { Module } from '@nestjs/common';
import { GoogleModule } from '@app/modules/google/google.module';
import { LocationsController } from '@app/modules/locations/controllers/locations.controller';
import { LocationsRepository } from '@app/modules/locations/repositories/locations.repository';
import { LocationsService } from '@app/modules/locations/services/locations.service';
import { MediaModule } from '@app/modules/media/media.module';
import { UsersModule } from '@app/modules/users/users.module';

@Module({
  imports: [MediaModule, UsersModule, GoogleModule],
  controllers: [LocationsController],
  providers: [LocationsService, LocationsRepository],
  exports: [LocationsService],
})
export class LocationsModule {}
