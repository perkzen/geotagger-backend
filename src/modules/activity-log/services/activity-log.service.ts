import { Injectable } from '@nestjs/common';
import { CreateActivityLogDto } from '@app/modules/activity-log/dtos/create-activity-log.dto';
import { ActivityLogRepository } from '@app/modules/activity-log/repositories/activity-log.repository';

@Injectable()
export class ActivityLogService {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  async getLogs() {
    return this.activityLogRepository.findMany();
  }

  async create(userId: string, data: CreateActivityLogDto) {
    return this.activityLogRepository.create({
      ...data,
      userId,
    });
  }
}
