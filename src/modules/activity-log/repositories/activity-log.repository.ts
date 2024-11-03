import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationQuery } from '@app/common/pagination/pagination.query';
import { PrismaService } from '@app/modules/db/prisma.service';

@Injectable()
export class ActivityLogRepository {
  private readonly activityLog: PrismaService['activityLog'];

  constructor(private readonly db: PrismaService) {
    this.activityLog = this.db.activityLog;
  }

  async create(data: Prisma.ActivityLogUncheckedCreateInput) {
    return this.activityLog.create({
      data,
    });
  }

  async findManyWithPagination({ take, skip }: PaginationQuery) {
    const query: Prisma.ActivityLogFindManyArgs = {
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
            imageUrl: true,
            media: {
              select: {
                key: true,
              },
            },
          },
        },
      },
      take,
      skip,
    };

    type ActivityLogWithUser = Prisma.ActivityLogGetPayload<typeof query>;

    return this.db.$transaction([this.activityLog.findMany(query), this.activityLog.count()]) as Promise<
      [ActivityLogWithUser[], number]
    >;
  }
}
