import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsNumber, IsPositive, IsString } from 'class-validator';

export class GuessDto {
  @ApiProperty()
  @Expose()
  @IsString()
  id: string;

  @ApiProperty()
  @Expose()
  @IsNumber()
  @IsPositive()
  distance: number;

  @ApiProperty()
  @Expose()
  @IsString()
  distanceText: string;

  @ApiProperty()
  @Expose()
  @IsString()
  address: string;

  @ApiProperty()
  @Expose()
  @IsString()
  userId: string;

  @ApiProperty()
  @Expose()
  @IsString()
  locationId: string;

  @ApiProperty()
  @Expose()
  @IsDate()
  createdAt: Date;
}
