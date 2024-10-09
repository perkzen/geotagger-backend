import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class AuthTokensDto {
  @ApiProperty()
  @IsString()
  @Expose()
  accessToken: string;

  @ApiProperty()
  @IsString()
  @Expose()
  refreshToken: string;
}
