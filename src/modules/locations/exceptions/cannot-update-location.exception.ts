import { BadRequestException } from '@nestjs/common';
import { LocationErrorCode } from '@app/modules/locations/enums/location-error-code.enum';

export class CannotUpdateLocationException extends BadRequestException {
  constructor() {
    super('Cannot update location');
  }

  getResponse(): object {
    const response = super.getResponse() as object;

    return {
      ...response,
      code: LocationErrorCode.CANNOT_UPDATE_LOCATION,
    };
  }
}
