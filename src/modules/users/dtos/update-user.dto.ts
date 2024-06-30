import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from '@app/modules/users/dtos/create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
