import { ForbiddenException } from '@nestjs/common';

export class CannotAccessResourceException extends ForbiddenException {
  constructor() {
    super('Cannot access the requested resource');
  }

  getResponse(): object {
    const response = super.getResponse() as object;

    return {
      ...response,
      code: 'CANNOT_ACCESS_RESOURCE',
    };
  }
}
