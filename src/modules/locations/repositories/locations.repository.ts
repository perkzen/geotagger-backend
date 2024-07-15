import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/modules/db/prisma.service';
import { CreateLocationDto } from '@app/modules/locations/dtos/create-location.dto';

@Injectable()
export class LocationsRepository {
  private readonly location: PrismaService['location'];

  constructor(private readonly db: PrismaService) {
    this.location = this.db.location;
  }

  async create(data: CreateLocationDto, mediaId: string) {
    return this.location.create({
      data: {
        ...data,
        media: {
          connect: {
            id: mediaId,
          },
        },
      },
    });
  }
}
