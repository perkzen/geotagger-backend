import { BadRequestException } from '@nestjs/common';
import { UserErrorCode } from '@app/modules/users/enum/user-error-code.enum';

export class NotEnoughPointsException extends BadRequestException {
  constructor(points: number, required: number) {
    super('Not enough points to make a guess', `You have ${points} points, but you need ${required} to make a guess.`);
  }

  getResponse(): object {
    const response = super.getResponse() as object;

    return {
      ...response,
      code: UserErrorCode.NOT_ENOUGH_POINTS,
    };
  }
}
