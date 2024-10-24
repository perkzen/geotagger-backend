import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { AddressDto } from '@app/modules/google/maps/dtos/address.dto';
import { CoordinatesDto } from '@app/modules/google/maps/dtos/coordinates.dto';
import { DistanceDto } from '@app/modules/google/maps/dtos/distance.dto';
import { CannotCalculateDistanceException } from '@app/modules/google/maps/exceptions/cannot-calculate-distance.exception';
import { CannotGeocodeAddressOrCoordinatesException } from '@app/modules/google/maps/exceptions/cannot-geocode-address-or-coordinates.exception';
import { DistanceMatrixResponse } from '@app/modules/google/maps/types/distance-matrix-response.type';
import { GeocodeResponse } from '@app/modules/google/maps/types/geocode-response.type';
import { GeocodeOptions, GeocodeReturnType } from '@app/modules/google/maps/types/geocode.type';

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);
  private readonly DISTANCE_MATRIX_API_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';
  private readonly GEOCODE_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

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
    const res = await this.httpService.axiosRef.get<DistanceMatrixResponse>(this.DISTANCE_MATRIX_API_URL, {
      params: {
        origins: `${origin.lat},${origin.lng}`,
        destinations: `${destination.lat},${destination.lng}`,
        key: this.configService.getOrThrow('GOOGLE_MAPS_API_KEY'),
      },
    });

    if (res.data.rows[0].elements[0].status !== 'OK') {
      this.logger.error('Cannot calculate distance', { origin, destination });
      throw new CannotCalculateDistanceException();
    }

    return serializeToDto(DistanceDto, res.data);
  }

  async geocode<T extends GeocodeOptions>(options: T): Promise<GeocodeReturnType<T>> {
    const params =
      options.type === 'address'
        ? { address: options.data.address }
        : { latlng: `${options.data.lat},${options.data.lng}` };

    const res = await this.httpService.axiosRef.get<GeocodeResponse>(this.GEOCODE_API_URL, {
      params: {
        ...params,
        key: this.configService.getOrThrow('GOOGLE_MAPS_API_KEY'),
      },
    });

    if (res.data.status !== 'OK' || res.data.results.length === 0) {
      this.logger.error('Cannot geocode address or coordinates', { options });
      throw new CannotGeocodeAddressOrCoordinatesException();
    }

    if (options.type === 'address') {
      return serializeToDto(CoordinatesDto, res.data.results[0].geometry.location) as GeocodeReturnType<T>;
    }

    return serializeToDto(AddressDto, res.data.results[0]) as GeocodeReturnType<T>;
  }
}
