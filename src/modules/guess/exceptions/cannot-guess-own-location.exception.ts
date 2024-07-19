import { ForbiddenException } from '@nestjs/common';
import { GuessErrorCode } from '@app/modules/guess/enums/guess-error-code.enum';

export class CannotGuessOwnLocationException extends ForbiddenException {
  constructor() {
    super('Cannot guess on your own location');
  }

  getResponse(): object {
    const response = super.getResponse() as object;

    return {
      ...response,
      code: GuessErrorCode.CANNOT_GUESS_OWN_LOCATION,
    };
  }
}
