import { BadRequestException } from '@nestjs/common';
import { MediaErrorCode } from '@app/modules/media/enums/media-error-code.enum';

export class FailedUploadException extends BadRequestException {
  constructor() {
    super('Failed to upload the media object');
  }

  getResponse(): object {
    const response = super.getResponse() as object;

    return {
      ...response,
      code: MediaErrorCode.FAILED_UPLOAD,
    };
  }
}
