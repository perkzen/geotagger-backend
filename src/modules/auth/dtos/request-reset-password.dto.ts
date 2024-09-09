import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestResetPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
