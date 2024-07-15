import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { BaseLocationDto } from '@app/modules/locations/dtos/base-location.dto';
import { CreateLocationDto, CreateLocationSwaggerDto } from '@app/modules/locations/dtos/create-location.dto';
import { LocationDto } from '@app/modules/locations/dtos/location.dto';
import { LocationsService } from '@app/modules/locations/services/locations.service';
import { UploadedImage } from '@app/modules/media/decorators/uploaded-image.decorator';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateLocationSwaggerDto })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create location' })
  @ApiCreatedResponse({ type: LocationDto })
  async create(
    @User('userId') userId: string,
    @Body() dto: CreateLocationDto,
    @UploadedImage() image: Express.Multer.File,
  ) {
    const location = this.locationsService.create(userId, serializeToDto(CreateLocationDto, dto), image);
    return serializeToDto(LocationDto, location);
  }
}
