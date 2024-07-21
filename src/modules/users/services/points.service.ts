import { Injectable, Logger } from '@nestjs/common';
import {
  POINTS_LOST_FIRST_GUESS,
  POINTS_LOST_SECOND_GUESS,
  POINTS_LOST_THIRD_AND_SUBSEQUENT_GUESSES,
  POINTS_PER_LOCATION_UPLOAD,
} from '@app/modules/users/constants/points.constants';
import { NotEnoughPointsException } from '@app/modules/users/exceptions/not-enough-points.exception';
import { UsersRepository } from '@app/modules/users/repositories/users.repository';
import { UsersService } from '@app/modules/users/services/users.service';

@Injectable()
export class PointsService {
  private readonly logger = new Logger(PointsService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Increment points for the user.
   * - User gets 10 points for each location uploaded.
   *
   * @param userId
   * @param points
   */
  async incrementPoints(userId: string, points = POINTS_PER_LOCATION_UPLOAD) {
    await this._incrementPoints(userId, points);
  }

  /**
   * Decrement points based on the number of guesses made.
   * - First guess: - 1 point
   * - Second guess: - 2 points
   * - Third and subsequent guesses: - 3 points
   *
   * @param userId
   * @param guesses
   */
  async decrementPoints(userId: string, guesses: number) {
    switch (guesses) {
      case 0:
        await this._decrementPoints(userId, POINTS_LOST_FIRST_GUESS);
        break;
      case 1:
        await this._decrementPoints(userId, POINTS_LOST_SECOND_GUESS);
        break;
      default:
        await this._decrementPoints(userId, POINTS_LOST_THIRD_AND_SUBSEQUENT_GUESSES);
    }
  }

  private async _incrementPoints(userId: string, points: number) {
    await this.usersRepository.update(userId, { points: { increment: points } });
  }

  private async _decrementPoints(userId: string, points: number) {
    const user = await this.usersService.findById(userId);

    if (user.points < points) {
      throw new NotEnoughPointsException(user.points, points);
    }

    await this.usersRepository.update(userId, { points: { decrement: points } });
  }
}
