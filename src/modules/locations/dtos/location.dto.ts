import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUrl } from 'class-validator';
import { BaseLocationDto } from '@app/modules/locations/dtos/base-location.dto';

export class LocationDto extends BaseLocationDto {
  @ApiProperty()
  @IsUrl()
  @Expose()
  imageUrl: string;
}
