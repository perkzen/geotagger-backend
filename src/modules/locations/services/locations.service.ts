import { Injectable, Logger } from '@nestjs/common';
import { Location } from '@prisma/client';
import { CannotAccessResourceException } from '@app/common/exceptions/cannot-access-resource.exception';
import { PaginationQuery } from '@app/common/pagination/pagination.query';
import { BucketPath } from '@app/modules/aws/s3/enums/bucket-path.enum';
import { CreateLocationDto } from '@app/modules/locations/dtos/create-location.dto';
import { LocationDetailsDto } from '@app/modules/locations/dtos/location-details.dto';
import { LocationDto } from '@app/modules/locations/dtos/location.dto';
import { UpdateLocationDto } from '@app/modules/locations/dtos/update-location.dto';
import { CannotCreateLocationException } from '@app/modules/locations/exceptions/cannot-create-location.exception';
import { CannotUpdateLocationException } from '@app/modules/locations/exceptions/cannot-update-location.exception';
import { LocationNotFoundException } from '@app/modules/locations/exceptions/location-not-found.exception';
import { LocationsRepository } from '@app/modules/locations/repositories/locations.repository';
import { MediaService } from '@app/modules/media/services/media.service';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    private readonly locationsRepository: LocationsRepository,
    private readonly mediaService: MediaService,
  ) {}

  private async toLocationDto(location: Location, mediaKey: string): Promise<LocationDto> {
    const imageUrl = await this.mediaService.getMediaUrl(mediaKey);
    return { ...location, imageUrl };
  }

  private async toLocationDetailsDto(
    location: Awaited<ReturnType<typeof this.locationsRepository.findOneWithDetails>>,
  ): Promise<LocationDetailsDto> {
    const imageUrl = await this.mediaService.getMediaUrl(location.media.key);

    const mediaKeys = new Set(
      location.guesses.filter((guess) => guess.user.media).map((guess) => guess.user.media.key),
    );

    const mediaUrls = await Promise.all(Array.from(mediaKeys).map((key) => this.mediaService.getMediaUrl(key)));
    const mediaUrlMap = new Map(Array.from(mediaKeys).map((key, index) => [key, mediaUrls[index]]));

    const guesses = await Promise.all(
      location.guesses.map((guess) => {
        const { user, id, distanceText, createdAt } = guess;
        const imageUrl = user.media ? mediaUrlMap.get(user.media.key) : user.imageUrl;

        return {
          id,
          displayName: `${user.firstname} ${user.lastname}`,
          imageUrl,
          distance: distanceText,
          createdAt,
        };
      }),
    );

    return { ...location, imageUrl, guesses };
  }

  async create(userId: string, dto: CreateLocationDto, image: Express.Multer.File) {
    const media = await this.mediaService.uploadMedia(image, BucketPath.LOCATIONS_IMAGES);

    try {
      const location = await this.locationsRepository.create({ ...dto, userId, mediaId: media.id });
      return this.toLocationDto(location, media.key);
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

    return this.toLocationDetailsDto(location);
  }

  async findById(id: string) {
    const location = await this.locationsRepository.findOne(id, { media: true });

    if (!location) {
      throw new LocationNotFoundException(id);
    }

    return this.toLocationDto(location, location.media.key);
  }

  async listByUser(userId: string, query: PaginationQuery) {
    const [data, total] = await this.locationsRepository.findByUserIdWithPagination(userId, query);

    const locations = await Promise.all(data.map(async (location) => this.toLocationDto(location, location.media.key)));

    return { data: locations, meta: { total, take: query.take, skip: query.skip } };
  }

  async list(query: PaginationQuery) {
    const [data, total] = await this.locationsRepository.findManyWithPagination(query);

    const locations = await Promise.all(data.map(async (location) => this.toLocationDto(location, location.media.key)));

    return { data: locations, meta: { total, take: query.take, skip: query.skip } };
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
      const updatedLocation = await this.locationsRepository.update(id, dto);
      return await this.toLocationDto(updatedLocation, location.media.key);
    }

    const media = await this.mediaService.uploadMedia(image, BucketPath.LOCATIONS_IMAGES);

    try {
      await this.mediaService.deleteMedia(location.mediaId);
      const updatedLocation = await this.locationsRepository.update(id, { ...dto, mediaId: media.id });
      return await this.toLocationDto(updatedLocation, media.key);
    } catch (error) {
      await this.mediaService.deleteMedia(media.id);
      this.logger.log('Error updating location:', { userId, dto, error });
      throw new CannotUpdateLocationException();
    }
  }
}
