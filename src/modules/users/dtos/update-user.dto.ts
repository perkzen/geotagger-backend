import { PartialType } from '@nestjs/swagger';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';

export class UpdateUserDto extends PartialType(CreateLocalUserDto) {}
