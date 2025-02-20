import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { ApiOkPaginatedResponse } from '@app/common/decorators/api-ok-paginated-response.decorator';
import { PaginationQuery } from '@app/common/pagination/pagination.query';
import { serializeToPaginationDto } from '@app/common/pagination/serializte-to-pagniated-dto';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { AddressDto } from '@app/modules/google/maps/dtos/address.dto';
import { CoordinatesDto } from '@app/modules/google/maps/dtos/coordinates.dto';
import { CreateLocationDto, CreateLocationSwaggerDto } from '@app/modules/locations/dtos/create-location.dto';
import { GeocodeQueryDto } from '@app/modules/locations/dtos/geocode-query.dto';
import { LocationDetailsDto } from '@app/modules/locations/dtos/location-details.dto';
import { LocationDto } from '@app/modules/locations/dtos/location.dto';
import { UpdateLocationDto, UpdateLocationSwaggerDto } from '@app/modules/locations/dtos/update-location.dto';
import { LocationsService } from '@app/modules/locations/services/locations.service';
import { UploadedImage } from '@app/modules/media/decorators/uploaded-image.decorator';
import { MediaInterceptor } from '@app/modules/media/interceptors/media.interceptor';

@ApiTags('Location')
@ApiBearerAuth()
@ApiCookieAuth()
@UseInterceptors(MediaInterceptor)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('geocode')
  @ApiOperation({ summary: 'Geocode address or coordinates' })
  @ApiExtraModels(AddressDto, CoordinatesDto)
  @ApiOkResponse({
    schema: { anyOf: refs(AddressDto, CoordinatesDto) },
  })
  async geocode(@Query() query: GeocodeQueryDto) {
    return this.locationsService.geocode(query);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateLocationSwaggerDto })
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
  @ApiOperation({ summary: 'List locations with pagination' })
  @ApiOkPaginatedResponse(LocationDto)
  async list(@Query() query: PaginationQuery) {
    const data = await this.locationsService.list(query);
    return serializeToPaginationDto(LocationDto, data);
  }

  @Get('me')
  @ApiOperation({ summary: 'Find users locations' })
  @ApiOkPaginatedResponse(LocationDto)
  async getByUser(@Query() query: PaginationQuery, @User('id') userId: string) {
    const data = await this.locationsService.listByUser(userId, query);
    return serializeToPaginationDto(LocationDto, data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find location by id' })
  @ApiCreatedResponse({ type: LocationDetailsDto })
  async getById(@Param('id') id: string) {
    const location = await this.locationsService.getLocationDetails(id);
    return serializeToDto(LocationDetailsDto, location);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete location by id' })
  async delete(@Param('id') id: string, @User('id') userId: string) {
    await this.locationsService.delete(id, userId);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
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
