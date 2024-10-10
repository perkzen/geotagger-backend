import { InjectQueue } from '@nestjs/bullmq';
import { Body, Controller, Get, Logger, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { ActivityLogDto } from '@app/modules/activity-log/dtos/activity-log.dto';
import { CreateActivityLogDto } from '@app/modules/activity-log/dtos/create-activity-log.dto';
import { JobName } from '@app/modules/activity-log/enums/job-name.enum';
import { ProcessActivityLogPayload } from '@app/modules/activity-log/interfaces/process-activity-log-payload.interface';
import { ActivityLogService } from '@app/modules/activity-log/services/activity-log.service';
import { Roles } from '@app/modules/auth/decorators/role.decorator';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { Role } from '@app/modules/auth/enums/role.enum';
import { RolesGuard } from '@app/modules/auth/guards/roles.guard';
import { MediaInterceptor } from '@app/modules/media/interceptors/media.interceptor';
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
  @ApiOperation({ summary: 'Get activity log for last 100 actions' })
  @ApiOkResponse({ type: ActivityLogDto, isArray: true })
  async getLogs() {
    const data = await this.activityLogService.getLogs();
    return serializeToDto(ActivityLogDto, data);
  }
}
