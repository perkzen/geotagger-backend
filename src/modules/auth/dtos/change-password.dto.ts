import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsStrongPassword()
  currentPassword: string;

  @ApiProperty()
  @IsStrongPassword()
  newPassword: string;
}
