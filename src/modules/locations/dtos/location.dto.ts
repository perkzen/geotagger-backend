import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsUrl } from 'class-validator';
import { BaseLocationDto } from '@app/modules/locations/dtos/base-location.dto';

export class LocationDto extends BaseLocationDto {
  @ApiProperty()
  @IsString()
  @Expose()
  id: string;

  @ApiProperty()
  @IsString()
  @Expose()
  userId: string;

  @ApiProperty()
  @IsUrl()
  @Expose()
  imageUrl: string;
}
