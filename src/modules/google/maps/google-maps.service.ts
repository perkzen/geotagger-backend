import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { DistanceDto } from '@app/modules/google/maps/dtos/distance.dto';
import { CannotCalculateDistanceException } from '@app/modules/google/maps/exceptions/cannot-calculate-distance.exception';
import { DistanceMatrixResponse } from '@app/modules/google/maps/types/distance-matrix-response.type';

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);
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
    const res = (await this.httpService.axiosRef.get(this.DISTANCE_MATRIX_API_URL, {
      params: {
        origins: `${origin.lat},${origin.lng}`,
        destinations: `${destination.lat},${destination.lng}`,
        key: this.configService.getOrThrow('GOOGLE_MAPS_API_KEY'),
      },
    })) as AxiosResponse<DistanceMatrixResponse>;

    if (res.data.rows[0].elements[0].status !== 'OK') {
      this.logger.error('Cannot calculate distance', { origin, destination });
      throw new CannotCalculateDistanceException();
    }

    return serializeToDto(DistanceDto, res.data) as DistanceDto;
  }
}
