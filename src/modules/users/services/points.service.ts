import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
   * @param tx
   */
  async incrementPoints(userId: string, points = POINTS_PER_LOCATION_UPLOAD, tx?: Prisma.TransactionClient) {
    await this._incrementPoints(userId, points, tx);
  }

  /**
   * Decrement points based on the number of guesses made.
   * - First guess: - 1 point
   * - Second guess: - 2 points
   * - Third and subsequent guesses: - 3 points
   *
   * @param userId
   * @param guesses
   * @param tx
   */
  async decrementPoints(userId: string, guesses: number, tx?: Prisma.TransactionClient) {
    switch (guesses) {
      case 0:
        await this._decrementPoints(userId, POINTS_LOST_FIRST_GUESS, tx);
        break;
      case 1:
        await this._decrementPoints(userId, POINTS_LOST_SECOND_GUESS);
        break;
      default:
        await this._decrementPoints(userId, POINTS_LOST_THIRD_AND_SUBSEQUENT_GUESSES);
    }
  }

  private async _incrementPoints(userId: string, points: number, tx?: Prisma.TransactionClient) {
    await this.usersRepository.incrementPoints(userId, points, tx);
  }

  private async _decrementPoints(userId: string, points: number, tx?: Prisma.TransactionClient) {
    const user = await this.usersService.findById(userId);

    if (user.points < points) {
      throw new NotEnoughPointsException(user.points, points);
    }

    await this.usersRepository.decrementPoints(userId, points, tx);
  }
}
