import { Injectable, Logger } from '@nestjs/common';
import { PaginationQuery } from '@app/common/pagination/pagination.query';
import { GoogleMapsService } from '@app/modules/google/maps/google-maps.service';
import { CreateGuessDto } from '@app/modules/guess/dtos/create-guess.dto';
import { CannotGuessOwnLocationException } from '@app/modules/guess/exceptions/cannot-guess-own-location.exception';
import { GuessRepository } from '@app/modules/guess/repositories/guess.repository';
import { LocationsService } from '@app/modules/locations/services/locations.service';
import { PointsService } from '@app/modules/users/services/points.service';

@Injectable()
export class GuessService {
  private readonly logger = new Logger(GuessService.name);

  constructor(
    private readonly guessRepository: GuessRepository,
    private readonly googleMapsService: GoogleMapsService,
    private readonly locationsService: LocationsService,
    private readonly pointsService: PointsService,
  ) {}

  async create(data: CreateGuessDto, userId: string, locationId: string) {
    const location = await this.locationsService.findById(locationId);

    if (location.userId === userId) {
      this.logger.error(`User ${userId} tried to guess their own location`);
      throw new CannotGuessOwnLocationException();
    }

    const count = await this.guessRepository.guessCount(userId, locationId);

    const { distance } = await this.googleMapsService.calculateDistance(
      {
        lat: data.lat,
        lng: data.lng,
      },
      { lat: location.lat, lng: location.lng },
    );

    const { address } = await this.googleMapsService.geocode({
      type: 'coordinates',
      data: { lat: data.lat, lng: data.lng },
    });

    return await this.guessRepository.transaction(async (tx) => {
      await this.pointsService.decrementPointsOnGuess(userId, count, tx);
      return await this.guessRepository.create(
        {
          userId,
          locationId,
          distance: distance.value,
          distanceText: distance.text,
          address,
        },
        tx,
      );
    });
  }

  async getUserBestScores(userId: string, query: PaginationQuery) {
    const [data, total] = await this.guessRepository.findByUserId(userId, query);

    return {
      data,
      meta: {
        total,
        take: query.take,
        skip: query.skip,
      },
    };
  }
}
