import { MediaUploadedEventPayload } from '@app/modules/media/interfaces/media-uploaded-event-payload.interface';

export class MediaUploadedEvent {
  constructor(public readonly payload: MediaUploadedEventPayload) {}
}
