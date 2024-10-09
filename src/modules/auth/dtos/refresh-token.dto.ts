import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  refreshToken: string;
}
