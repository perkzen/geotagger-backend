import { Module } from '@nestjs/common';
import { AwsModule } from '@app/modules/aws/aws.module';
import { MediaRepository } from '@app/modules/media/repositories/media.repository';
import { MediaService } from '@app/modules/media/services/media.service';

@Module({
  imports: [AwsModule],
  providers: [MediaService, MediaRepository],
  exports: [MediaService],
})
export class MediaModule {}
