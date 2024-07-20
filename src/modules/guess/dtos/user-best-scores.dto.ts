import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class UserBestScoresDto {
  @ApiProperty()
  @Expose({
    name: 'distanceText',
  })
  distance: string;

  @ApiProperty()
  @Expose({
    name: 'location',
  })
  @Transform(({ value }) => value.id)
  locationId: string;

  @ApiProperty()
  @Expose()
  imageUrl: string;
}
