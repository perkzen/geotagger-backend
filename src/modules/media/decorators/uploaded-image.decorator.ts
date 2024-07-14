import { UploadedFile } from '@nestjs/common';
import { ParseImagePipe } from '@app/modules/media/pipes/parse-image.pipe';

export const UploadedImage = (required = true): ParameterDecorator => {
  return UploadedFile(new ParseImagePipe(required));
};
