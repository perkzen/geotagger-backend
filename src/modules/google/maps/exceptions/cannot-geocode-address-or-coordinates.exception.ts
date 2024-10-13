import { BadRequestException } from '@nestjs/common';
import { GoogleMapsErrorCode } from '@app/modules/google/maps/enums/google-maps-error-code.enum';

export class CannotGeocodeAddressOrCoordinatesException extends BadRequestException {
  constructor() {
    super('Cannot geocode address or coordinates');
  }

  getResponse(): object {
    const response = super.getResponse() as object;

    return {
      ...response,
      code: GoogleMapsErrorCode.CANNOT_GEOCODE_ADDRESS_OR_COORDINATES,
    };
  }
}
