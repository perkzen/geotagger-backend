import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';

const MAX_FILE_SIZE = 1024 * 1024 * 2; // 2MB
const ALLOWED_IMAGE_TYPES = '.(png|jpeg|jpg)'; // allows .jpg, .jpeg, .png

export class ParseImagePipe extends ParseFilePipe {
  constructor(required = true) {
    super({
      validators: [
        new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
        new FileTypeValidator({
          fileType: ALLOWED_IMAGE_TYPES,
        }),
      ],
      fileIsRequired: required,
    });
  }
}
