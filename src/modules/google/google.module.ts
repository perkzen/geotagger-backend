import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GoogleMapsService } from '@app/modules/google/maps/google-maps.service';

@Module({
  imports: [HttpModule],
  providers: [GoogleMapsService],
  exports: [GoogleMapsService],
})
export class GoogleModule {}
