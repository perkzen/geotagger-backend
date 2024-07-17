import { Module } from '@nestjs/common';
import { LocationsController } from '@app/modules/locations/controllers/locations.controller';
import { LocationsRepository } from '@app/modules/locations/repositories/locations.repository';
import { LocationsService } from '@app/modules/locations/services/locations.service';
import { MediaModule } from '@app/modules/media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [LocationsController],
  providers: [LocationsService, LocationsRepository],
})
export class LocationsModule {}
