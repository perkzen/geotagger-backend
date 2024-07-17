import { BadRequestException } from '@nestjs/common';
import { LocationErrorCode } from '@app/modules/locations/enums/location-error-code.enum';

export class CannotCreateLocationException extends BadRequestException {
  constructor() {
    super('Cannot create location');
  }

  getResponse(): object {
    const response = super.getResponse() as object;

    return {
      ...response,
      code: LocationErrorCode.CANNOT_CREATE_LOCATION,
    };
  }
}
