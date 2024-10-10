import { CreateActivityLogDto } from '@app/modules/activity-log/dtos/create-activity-log.dto';

export interface ProcessActivityLogPayload {
  userId: string;
  activity: CreateActivityLogDto;
}
