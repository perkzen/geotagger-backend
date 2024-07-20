import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GuessDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  distance: number;

  @ApiProperty()
  @Expose()
  distanceText: string;

  @ApiProperty()
  @Expose()
  userId: number;

  @ApiProperty()
  @Expose()
  locationId: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
