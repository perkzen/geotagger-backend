import { NotFoundException } from '@nestjs/common';
import { LocationErrorCode } from '@app/modules/locations/enums/location-error-code.enum';

export class LocationNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Location with id ${id} not found`);
  }

  getResponse(): object {
    const response = super.getResponse() as object;
    return {
      ...response,
      code: LocationErrorCode.LOCATION_NOT_FOUND,
    };
  }
}
