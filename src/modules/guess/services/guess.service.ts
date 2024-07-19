import { Injectable, Logger } from '@nestjs/common';
import { GoogleMapsService } from '@app/modules/google/maps/google-maps.service';
import { CreateGuessDto } from '@app/modules/guess/dtos/create-guess.dto';
import { CannotGuessOwnLocationException } from '@app/modules/guess/exceptions/cannot-guess-own-location.exception';
import { UserAlreadyGuessedException } from '@app/modules/guess/exceptions/user-already-guessed.exception';
import { GuessRepository } from '@app/modules/guess/repositories/guess.repository';
import { LocationsService } from '@app/modules/locations/services/locations.service';

@Injectable()
export class GuessService {
  private readonly logger = new Logger(GuessService.name);

  constructor(
    private readonly guessRepository: GuessRepository,
    private readonly googleMapsService: GoogleMapsService,
    private readonly locationsService: LocationsService,
  ) {}

  async create(data: CreateGuessDto, userId: string, locationId: string) {
    const location = await this.locationsService.findById(locationId);

    if (location.userId === userId) {
      this.logger.error(`User ${userId} tried to guess their own location`);
      throw new CannotGuessOwnLocationException();
    }

    if (await this.guessRepository.exists(userId, locationId)) {
      this.logger.error(`User ${userId} already guessed location ${locationId}`);
      throw new UserAlreadyGuessedException();
    }

    const { distance } = await this.googleMapsService.calculateDistance(
      {
        lat: data.lat,
        lng: data.lng,
      },
      { lat: location.lat, lng: location.lng },
    );

    return await this.guessRepository.create({
      userId,
      locationId,
      distance: distance.value,
      distanceText: distance.text,
    });
  }
}
