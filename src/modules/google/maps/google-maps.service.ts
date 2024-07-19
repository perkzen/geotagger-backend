import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { DistanceDto } from '@app/modules/google/maps/dtos/distance.dto';

@Injectable()
export class GoogleMapsService {
  private readonly DISTANCE_MATRIX_API_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async calculateDistance(
    origin: { lat: number; lng: number },
    destination: {
      lat: number;
      lng: number;
    },
  ) {
    const res = await this.httpService.axiosRef.get(this.DISTANCE_MATRIX_API_URL, {
      params: {
        origins: `${origin.lat},${origin.lng}`,
        destinations: `${destination.lat},${destination.lng}`,
        key: this.configService.getOrThrow('GOOGLE_MAPS_API_KEY'),
      },
    });

    return serializeToDto(DistanceDto, res.data) as unknown as DistanceDto;
  }
}
