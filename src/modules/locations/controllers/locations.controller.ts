import { Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { User } from '@app/modules/auth/decorators/user.decorator';
import { CreateLocationDto, CreateLocationSwaggerDto } from '@app/modules/locations/dtos/create-location.dto';
import { LocationDto } from '@app/modules/locations/dtos/location.dto';
import { UpdateLocationDto } from '@app/modules/locations/dtos/update-location.dto';
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
    const locationDto = serializeToDto(CreateLocationDto, dto);
    const location = this.locationsService.create(userId, locationDto, image);
    return serializeToDto(LocationDto, location);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find users locations' })
  @ApiCreatedResponse({ type: [LocationDto] })
  async getByUser(@User('userId') userId: string) {
    const locations = await this.locationsService.findByUser(userId);
    return serializeToDto(LocationDto, locations);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find location by id' })
  @ApiCreatedResponse({ type: LocationDto })
  async getById(@Param('id') id: string) {
    const location = this.locationsService.findById(id);
    return serializeToDto(LocationDto, location);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete location by id' })
  async delete(@Param('id') id: string, @User('userId') userId: string) {
    await this.locationsService.delete(id, userId);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update location by id' })
  @ApiCreatedResponse({ type: LocationDto })
  async update(
    @Param('id') id: string,
    @User('userId') userId: string,
    @Body() dto: UpdateLocationDto,
    @UploadedImage() image: Express.Multer.File,
  ) {
    const locationDto = serializeToDto(UpdateLocationDto, dto);
    const res = await this.locationsService.update(id, userId, locationDto, image);
    return serializeToDto(LocationDto, res);
  }
}
