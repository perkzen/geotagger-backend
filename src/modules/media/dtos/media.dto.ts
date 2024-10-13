import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MediaDto {
  @ApiProperty()
  @Expose()
  key: string;

  @ApiProperty()
  @Expose()
  keyUrl: string;
}
