import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkPaginatedResponse } from '@app/common/decorators/api-ok-paginated-response.decorator';
import { PaginationQuery } from '@app/common/pagination/pagination.query';
import { serializeToPaginationDto } from '@app/common/pagination/serializte-to-pagniated-dto';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { CreateLocationDto, CreateLocationSwaggerDto } from '@app/modules/locations/dtos/create-location.dto';
import { LocationDetailsDto } from '@app/modules/locations/dtos/location-details.dto';
import { LocationDto } from '@app/modules/locations/dtos/location.dto';
import { UpdateLocationDto, UpdateLocationSwaggerDto } from '@app/modules/locations/dtos/update-location.dto';
import { LocationsService } from '@app/modules/locations/services/locations.service';
import { UploadedImage } from '@app/modules/media/decorators/uploaded-image.decorator';
import { MediaInterceptor } from '@app/modules/media/interceptors/media.interceptor';

@ApiTags('Location')
@UseInterceptors(MediaInterceptor)
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
    @User('id') userId: string,
    @Body() dto: CreateLocationDto,
    @UploadedImage() image: Express.Multer.File,
  ) {
    const locationDto = serializeToDto(CreateLocationDto, dto);
    const location = this.locationsService.create(userId, locationDto, image);
    return serializeToDto(LocationDto, location);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List locations with pagination' })
  @ApiOkPaginatedResponse(LocationDto)
  async list(@Query() query: PaginationQuery) {
    const data = await this.locationsService.list(query);
    return serializeToPaginationDto(LocationDto, data);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find users locations' })
  @ApiOkPaginatedResponse(LocationDto)
  async getByUser(@Query() query: PaginationQuery, @User('id') userId: string) {
    const data = await this.locationsService.listByUser(userId, query);
    return serializeToPaginationDto(LocationDto, data);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find location by id' })
  @ApiCreatedResponse({ type: LocationDto })
  async getById(@Param('id') id: string) {
    const location = await this.locationsService.getLocationDetails(id);
    return serializeToDto(LocationDetailsDto, location);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete location by id' })
  async delete(@Param('id') id: string, @User('id') userId: string) {
    await this.locationsService.delete(id, userId);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update location by id' })
  @ApiBody({ type: UpdateLocationSwaggerDto })
  @ApiCreatedResponse({ type: LocationDto })
  async update(
    @Param('id') id: string,
    @User('id') userId: string,
    @Body() dto: UpdateLocationDto,
    @UploadedImage(false) image?: Express.Multer.File,
  ) {
    const locationDto = serializeToDto(UpdateLocationDto, dto);
    const res = await this.locationsService.update(id, userId, locationDto, image);
    return serializeToDto(LocationDto, res);
  }
}
