import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateLocalUserDto } from '@app/modules/users/dtos/create-local-user.dto';

export class UpdateUserDto extends PartialType(OmitType(CreateLocalUserDto, ['password'] as const)) {}
