import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AwsModule } from '@app/modules/aws/aws.module';
import { MediaConsumer } from '@app/modules/media/consumers/media.consumer';
import { MediaController } from '@app/modules/media/controllers/media.controller';
import { MediaRepository } from '@app/modules/media/repositories/media.repository';
import { MediaService } from '@app/modules/media/services/media.service';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { configureQueue } from '@app/modules/queue/utils/configure-queue';

@Module({
  imports: [AwsModule, HttpModule, ...configureQueue([QueueName.MEDIA])],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository, MediaConsumer],
  exports: [MediaService],
})
export class MediaModule {}
