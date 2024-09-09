import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsStrongPassword()
  password: string;
}
