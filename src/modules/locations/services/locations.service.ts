import { Injectable, Logger } from '@nestjs/common';
import { BucketPath } from '@app/modules/aws/s3/enums/bucket-path.enum';
import { CreateLocationDto } from '@app/modules/locations/dtos/create-location.dto';
import { LocationsRepository } from '@app/modules/locations/repositories/locations.repository';
import { MediaService } from '@app/modules/media/services/media.service';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    private readonly locationsRepository: LocationsRepository,
    private readonly mediaService: MediaService,
  ) {}

  async create(userId: string, dto: CreateLocationDto, image: Express.Multer.File) {
    const media = await this.mediaService.uploadMedia(image, userId, BucketPath.LOCATIONS_IMAGES);

    try {
      const location = await this.locationsRepository.create(dto, media.id);
      return { ...location, imageUrl: await this.mediaService.getMediaUrl(media.key) };
    } catch (error) {
      await this.mediaService.deleteMedia(media.id);
      this.logger.log('Error creating location:', { userId, dto, error });
    }
  }
}
