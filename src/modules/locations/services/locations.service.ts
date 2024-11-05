import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Media } from '@prisma/client';
import { CannotAccessResourceException } from '@app/common/exceptions/cannot-access-resource.exception';
import { PaginationQuery } from '@app/common/pagination/pagination.query';
import { BucketPath } from '@app/modules/aws/s3/enums/bucket-path.enum';
import { GoogleMapsService } from '@app/modules/google/maps/google-maps.service';
import { GeocodeOptions } from '@app/modules/google/maps/types/geocode.type';
import { CreateLocationDto } from '@app/modules/locations/dtos/create-location.dto';
import { GeocodeQueryDto } from '@app/modules/locations/dtos/geocode-query.dto';
import { UpdateLocationDto } from '@app/modules/locations/dtos/update-location.dto';
import { CannotCreateLocationException } from '@app/modules/locations/exceptions/cannot-create-location.exception';
import { CannotUpdateLocationException } from '@app/modules/locations/exceptions/cannot-update-location.exception';
import { LocationNotFoundException } from '@app/modules/locations/exceptions/location-not-found.exception';
import { LocationsRepository } from '@app/modules/locations/repositories/locations.repository';
import { MediaEventName } from '@app/modules/media/enums/media-event-name.enum';
import { MediaUploadedEvent } from '@app/modules/media/events/media-uploaded.event';
import { MediaService } from '@app/modules/media/services/media.service';
import { POINTS_PER_LOCATION_UPLOAD } from '@app/modules/users/constants/points.constants';
import { PointsService } from '@app/modules/users/services/points.service';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    private readonly locationsRepository: LocationsRepository,
    private readonly mediaService: MediaService,
    private readonly pointsService: PointsService,
    private readonly googleMapsService: GoogleMapsService,
  ) {}

  async create(userId: string, dto: CreateLocationDto, image: Express.Multer.File) {
    let media: Media;

    try {
      media = await this.mediaService.upload(image, BucketPath.LOCATIONS_IMAGES);
      return await this.locationsRepository.transaction(async (tx) => {
        const location = await this.locationsRepository.create({ ...dto, userId, mediaId: media.id }, tx);
        await this.pointsService.incrementPoints(userId, POINTS_PER_LOCATION_UPLOAD, tx);

        return { ...location, media };
      });
    } catch (error) {
      if (media) await this.mediaService.delete(media.id);
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
    await this.locationsRepository.transaction(async (tx) => {
      const location = await this.locationsRepository.findOne(id, { media: true });

      if (!location) {
        throw new LocationNotFoundException(id);
      }

      if (location.userId !== userId) {
        throw new CannotAccessResourceException();
      }

      await tx.location.delete({ where: { id } });
      await this.mediaService.delete(location.mediaId, tx);
      await this.pointsService.decrementPoints(userId, POINTS_PER_LOCATION_UPLOAD, tx);
    });
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

    let media: Media;

    try {
      media = await this.mediaService.upload(image, BucketPath.LOCATIONS_IMAGES);
      return await this.locationsRepository.transaction(async (tx) => {
        await this.mediaService.delete(location.mediaId, tx);
        return await this.locationsRepository.update(id, { ...dto, mediaId: media.id }, tx);
      });
    } catch (error) {
      if (media) await this.mediaService.delete(media.id);
      this.logger.log('Error updating location:', { userId, dto, error });
      throw new CannotUpdateLocationException();
    }
  }

  async geocode(data: GeocodeQueryDto) {
    const payload: GeocodeOptions = data.address
      ? {
          type: 'address',
          data: { address: data.address },
        }
      : {
          type: 'coordinates',
          data: { lat: data.lat, lng: data.lng },
        };

    return this.googleMapsService.geocode(payload);
  }

  @OnEvent(MediaEventName.LOCATION_IMAGE_UPLOADED)
  async updateLocationImage({ payload }: MediaUploadedEvent) {
    const { ownerId, key, mimeType, filename } = payload;

    await this.locationsRepository.transaction(async (tx) => {
      const location = await tx.location.findUniqueOrThrow({
        where: {
          id: ownerId,
        },
        include: {
          media: true,
        },
      });

      const newMedia = await this.mediaService.create({ key, mimeType, filename }, tx);

      await tx.location.update({
        where: {
          id: ownerId,
        },
        data: {
          mediaId: newMedia.id,
        },
      });

      await this.mediaService.delete(location.mediaId, tx);
    });
  }
}
