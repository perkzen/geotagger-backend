import { InjectQueue } from '@nestjs/bullmq';
import { Body, Controller, Get, Logger, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Queue } from 'bullmq';
import { ApiOkPaginatedResponse } from '@app/common/decorators/api-ok-paginated-response.decorator';
import { PaginationQuery } from '@app/common/pagination/pagination.query';
import { serializeToPaginationDto } from '@app/common/pagination/serializte-to-pagniated-dto';
import { ActivityLogDto } from '@app/modules/activity-log/dtos/activity-log.dto';
import { CreateActivityLogDto } from '@app/modules/activity-log/dtos/create-activity-log.dto';
import { ProcessActivityLogPayload } from '@app/modules/activity-log/interfaces/process-activity-log-payload.interface';
import { ActivityLogService } from '@app/modules/activity-log/services/activity-log.service';
import { Roles } from '@app/modules/auth/decorators/role.decorator';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { Role } from '@app/modules/auth/enums/role.enum';
import { RolesGuard } from '@app/modules/auth/guards/roles.guard';
import { MediaInterceptor } from '@app/modules/media/interceptors/media.interceptor';
import { JobName } from '@app/modules/queue/enums/job-name.enum';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';

@ApiTags('Activity Log')
@ApiBearerAuth()
@ApiCookieAuth()
@Controller('activity-logs')
export class ActivityLogController {
  private readonly logger = new Logger(ActivityLogController.name);

  constructor(
    private readonly activityLogService: ActivityLogService,
    @InjectQueue(QueueName.ACTIVITY_LOG) private readonly queue: Queue<ProcessActivityLogPayload>,
  ) {}

  @Post()
  @SkipThrottle()
  @ApiOperation({ summary: 'Create activity log' })
  async create(@User('id') userId: string, @Body() dto: CreateActivityLogDto) {
    await this.queue.add(JobName.PROCESS_ACTIVITY_LOG, {
      userId,
      activity: dto,
    });

    this.logger.log(`Activity log was sent to the queue`);
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(MediaInterceptor)
  @ApiOperation({ summary: 'Get activity log' })
  @ApiOkPaginatedResponse(ActivityLogDto)
  async getLogs(@Query() query: PaginationQuery) {
    const data = await this.activityLogService.getLogs(query);
    return serializeToPaginationDto(ActivityLogDto, data);
  }
}
