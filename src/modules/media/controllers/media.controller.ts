import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bullmq';
import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { Public } from '@app/modules/auth/decorators/public.decorator';
import { S3Notification, SnsNotificationEvent } from '@app/modules/aws/sns/types/sns-notification-event';
import { CreateUploadUrlDto } from '@app/modules/media/dtos/create-upload-url.dto';
import { UrlDto } from '@app/modules/media/dtos/url.dto';
import { ProcessMediaPayload } from '@app/modules/media/interfaces/process-media-payload.interface';
import { MediaService } from '@app/modules/media/services/media.service';
import { JobName } from '@app/modules/queue/enums/job-name.enum';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(
    private readonly httpService: HttpService,
    private readonly mediaService: MediaService,
    @InjectQueue(QueueName.MEDIA) private readonly queue: Queue<ProcessMediaPayload>,
  ) {}

  @Public()
  @Post('uploaded/webhook')
  async webhook(@Body() body: SnsNotificationEvent) {
    if (body.Type === 'SubscriptionConfirmation') {
      await this.httpService.axiosRef.get(body.SubscribeURL);
    }

    if (body.Type === 'Notification') {
      try {
        const record = (JSON.parse(body.Message) as S3Notification).Records[0];
        await this.queue.add(JobName.PROCESS_MEDIA, { key: record.s3.object.key, bucket: record.s3.bucket.name });
      } catch (e) {
        throw new InternalServerErrorException('Failed to process S3 notification', e);
      }
    }
  }

  @ApiBearerAuth()
  @ApiCookieAuth()
  @Post('upload')
  @ApiOperation({ summary: 'Generates signed URL to upload media file' })
  @ApiCreatedResponse({ type: UrlDto })
  async getUploadUrl(@Body() dto: CreateUploadUrlDto) {
    const url = await this.mediaService.getUploadUrl(dto);
    return serializeToDto(UrlDto, { url });
  }
}
