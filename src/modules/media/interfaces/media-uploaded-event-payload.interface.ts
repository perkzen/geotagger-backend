import { MimeType } from '@app/common/enums/mime-type.enum';

export interface MediaUploadedEventPayload {
  key: string;
  filename: string;
  mimeType: MimeType;
  ownerId: string;
}
