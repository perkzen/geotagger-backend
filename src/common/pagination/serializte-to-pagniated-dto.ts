import { ClassConstructor } from 'class-transformer';
import { PaginatedDto } from '@app/common/pagination/paginated.dto';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';

export function serializeToPaginationDto<T extends object, V extends object>(
  dtoClass: ClassConstructor<T>,
  obj: PaginatedDto<V>,
): PaginatedDto<T> {
  const paginatedDto = serializeToDto(PaginatedDto, obj);
  return {
    ...paginatedDto,
    data: serializeToDto(dtoClass, obj.data),
  };
}
