import { BadRequestException } from '@nestjs/common';
import { GoogleMapsErrorCode } from '@app/modules/google/maps/enums/google-maps-error-code.enum';

export class CannotCalculateDistanceException extends BadRequestException {
  constructor() {
    super('Cannot calculate distance');
  }

  getResponse(): object {
    const response = super.getResponse() as object;

    return {
      ...response,
      code: GoogleMapsErrorCode.CANNOT_CALCULATE_DISTANCE,
    };
  }
}
