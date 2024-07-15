import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty()
  @IsStrongPassword()
  oldPassword: string;

  @ApiProperty()
  @IsStrongPassword()
  newPassword: string;
}
