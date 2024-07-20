import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsLatitude, IsLongitude, IsString, IsUrl } from 'class-validator';
import { MediaDto } from '@app/modules/media/dtos/media.dto';

export class LocationDto {
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

  @ApiProperty()
  @IsString()
  @Expose()
  address: string;

  @ApiProperty()
  @IsLatitude()
  @Expose()
  lat: number;

  @ApiProperty()
  @IsLongitude()
  @Expose()
  lng: number;

  @ApiProperty()
  @Expose()
  @Type(() => MediaDto)
  media: MediaDto;
}
