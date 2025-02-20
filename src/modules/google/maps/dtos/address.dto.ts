import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class AddressDto {
  @ApiProperty()
  @Expose({
    name: 'formatted_address',
  })
  @IsString()
  address: string;
}
