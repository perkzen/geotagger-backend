import { Injectable } from '@nestjs/common';
import { PaginationQuery } from '@app/common/pagination/pagination.query';
import { CreateActivityLogDto } from '@app/modules/activity-log/dtos/create-activity-log.dto';
import { ActivityLogRepository } from '@app/modules/activity-log/repositories/activity-log.repository';

@Injectable()
export class ActivityLogService {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  async getLogs(query: PaginationQuery) {
    const [data, total] = await this.activityLogRepository.findManyWithPagination(query);

    return { data, meta: { total, take: query.take, skip: query.skip } };
  }

  async create(userId: string, data: CreateActivityLogDto) {
    return this.activityLogRepository.create({
      ...data,
      userId,
    });
  }
}
