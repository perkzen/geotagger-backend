import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MediaDto } from '@app/modules/media/dtos/media.dto';

export class UserBestScoresDto {
  @ApiProperty()
  @Expose({
    name: 'distanceText',
  })
  distance: string;

  @ApiProperty()
  @Expose()
  location: { id: string; media: MediaDto };
}
