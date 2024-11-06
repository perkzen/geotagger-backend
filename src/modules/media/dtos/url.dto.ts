import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUrl } from 'class-validator';

export class UrlDto {
  @ApiProperty()
  @IsUrl()
  @Expose()
  url: string;
}
