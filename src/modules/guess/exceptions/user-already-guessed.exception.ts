import { BadRequestException } from '@nestjs/common';
import { GuessErrorCode } from '@app/modules/guess/enums/guess-error-code.enum';

export class UserAlreadyGuessedException extends BadRequestException {
  constructor() {
    super('User already tried to guess this location');
  }

  getResponse(): object {
    const response = super.getResponse() as object;

    return {
      ...response,
      code: GuessErrorCode.USER_ALREADY_GUESSED,
    };
  }
}
