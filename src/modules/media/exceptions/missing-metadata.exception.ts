import { BadRequestException } from '@nestjs/common';
import { MediaErrorCode } from '@app/modules/media/enums/media-error-code.enum';

export class MissingMetadataException extends BadRequestException {
  constructor(attribute: string) {
    super(`The metadata attribute "${attribute}" is missing in the media object`);
  }

  getResponse(): object {
    const response = super.getResponse() as object;

    return {
      ...response,
      code: MediaErrorCode.MISSING_METADATA,
    };
  }
}
