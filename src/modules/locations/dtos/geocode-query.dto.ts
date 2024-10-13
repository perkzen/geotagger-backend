import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsLatitude, IsLongitude, IsString, ValidateIf } from 'class-validator';

export class GeocodeQueryDto {
  @ApiProperty({ required: false })
  @ValidateIf((o: GeocodeQueryDto) => !o.lat && !o.lng)
  @IsString()
  address: string;

  @ApiProperty({ required: false })
  @ValidateIf((o: GeocodeQueryDto) => !o.address)
  @IsLatitude()
  @Transform(({ value }) => parseFloat(value))
  lat: number;

  @ApiProperty({ required: false })
  @ValidateIf((o: GeocodeQueryDto) => !o.address)
  @IsLongitude()
  @Transform(({ value }) => parseFloat(value))
  lng: number;
}
