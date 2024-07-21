import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { ActivityLogDto } from '@app/modules/activity-log/dtos/activity-log.dto';
import { CreateActivityLogDto } from '@app/modules/activity-log/dtos/create-activity-log.dto';
import { ActivityLogService } from '@app/modules/activity-log/services/activity-log.service';
import { Roles } from '@app/modules/auth/decorators/role.decorator';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { Role } from '@app/modules/auth/enums/role.enum';
import { RolesGuard } from '@app/modules/auth/guards/roles.guard';
import { MediaInterceptor } from '@app/modules/media/interceptors/media.interceptor';

@ApiTags('Activity Log')
@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create activity log' })
  async create(@User('id') userId: string, @Body() dto: CreateActivityLogDto) {
    const activityLog = await this.activityLogService.create(userId, dto);
    return serializeToDto(ActivityLogDto, activityLog);
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(MediaInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get activity log for last 100 actions' })
  @ApiOkResponse({ type: ActivityLogDto, isArray: true })
  async getLogs() {
    const data = await this.activityLogService.getLogs();
    return serializeToDto(ActivityLogDto, data);
  }
}
