import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsLatitude, IsLongitude, IsString } from 'class-validator';

export class BaseLocationDto {
  @ApiProperty()
  @IsString()
  @Expose()
  address: string;

  @ApiProperty()
  @IsLatitude()
  @Expose()
  @Transform(({ value }) => parseFloat(value))
  lat: number;

  @ApiProperty()
  @IsLongitude()
  @Expose()
  @Transform(({ value }) => parseFloat(value))
  lng: number;
}
