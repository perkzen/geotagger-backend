import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
