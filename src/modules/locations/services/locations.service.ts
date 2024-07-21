import { Injectable, Logger } from '@nestjs/common';
import { CannotAccessResourceException } from '@app/common/exceptions/cannot-access-resource.exception';
import { PaginationQuery } from '@app/common/pagination/pagination.query';
import { BucketPath } from '@app/modules/aws/s3/enums/bucket-path.enum';
import { CreateLocationDto } from '@app/modules/locations/dtos/create-location.dto';
import { UpdateLocationDto } from '@app/modules/locations/dtos/update-location.dto';
import { CannotCreateLocationException } from '@app/modules/locations/exceptions/cannot-create-location.exception';
import { CannotUpdateLocationException } from '@app/modules/locations/exceptions/cannot-update-location.exception';
import { LocationNotFoundException } from '@app/modules/locations/exceptions/location-not-found.exception';
import { LocationsRepository } from '@app/modules/locations/repositories/locations.repository';
import { MediaService } from '@app/modules/media/services/media.service';
import { PointsService } from '@app/modules/users/services/points.service';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    private readonly locationsRepository: LocationsRepository,
    private readonly mediaService: MediaService,
    private readonly pointsService: PointsService,
  ) {}

  async create(userId: string, dto: CreateLocationDto, image: Express.Multer.File) {
    const media = await this.mediaService.uploadMedia(image, BucketPath.LOCATIONS_IMAGES);

    try {
      const location = await this.locationsRepository.create({ ...dto, userId, mediaId: media.id });
      await this.pointsService.incrementPoints(userId);
      return { ...location, media };
    } catch (error) {
      await this.mediaService.deleteMedia(media.id);
      this.logger.log('Error creating location:', { userId, dto, error });
      throw new CannotCreateLocationException();
    }
  }

  async getLocationDetails(id: string) {
    const location = await this.locationsRepository.findOneWithDetails(id);

    if (!location) {
      throw new LocationNotFoundException(id);
    }

    return location;
  }

  async findById(id: string) {
    const location = await this.locationsRepository.findOne(id, { media: true });

    if (!location) {
      throw new LocationNotFoundException(id);
    }

    return location;
  }

  async listByUser(userId: string, query: PaginationQuery) {
    const [data, total] = await this.locationsRepository.findByUserIdWithPagination(userId, query);

    return { data, meta: { total, take: query.take, skip: query.skip } };
  }

  async list(query: PaginationQuery) {
    const [data, total] = await this.locationsRepository.findManyWithPagination(query);

    return { data, meta: { total, take: query.take, skip: query.skip } };
  }

  async delete(id: string, userId: string) {
    const location = await this.locationsRepository.findOne(id);

    if (!location) {
      throw new LocationNotFoundException(id);
    }

    if (location.userId !== userId) {
      throw new CannotAccessResourceException();
    }

    await this.mediaService.deleteMedia(location.mediaId);
    return this.locationsRepository.delete(id);
  }

  async update(id: string, userId: string, dto: UpdateLocationDto, image?: Express.Multer.File) {
    const location = await this.locationsRepository.findOne(id, { media: true });

    if (!location) {
      throw new LocationNotFoundException(id);
    }

    if (location.userId !== userId) {
      throw new CannotAccessResourceException();
    }

    if (!image) {
      return await this.locationsRepository.update(id, dto);
    }

    const media = await this.mediaService.uploadMedia(image, BucketPath.LOCATIONS_IMAGES);

    try {
      await this.mediaService.deleteMedia(location.mediaId);
      return await this.locationsRepository.update(id, { ...dto, mediaId: media.id });
    } catch (error) {
      await this.mediaService.deleteMedia(media.id);
      this.logger.log('Error updating location:', { userId, dto, error });
      throw new CannotUpdateLocationException();
    }
  }
}
