import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { MediaService } from '@app/modules/media/services/media.service';

@Injectable()
export class MediaInterceptor implements NestInterceptor {
  constructor(private readonly mediaService: MediaService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map(async (response) => {
        if (response?.data) {
          response.data = await this.processObject(response.data);
        } else {
          response = await this.processObject(response);
        }
        return response;
      }),
    );
  }

  /**
   * Recursively process object and replace to signed url if media key is present
   * @param obj
   * @private
   */
  private async processObject(obj: any): Promise<any> {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return Promise.all(obj.map((item) => this.processObject(item)));
    }

    const keys = Object.keys(obj);
    for (const key of keys) {
      if (key === 'media' && obj[key]?.key) {
        obj.imageUrl = await this.mediaService.getMediaUrl(obj[key].key);
      } else if (typeof obj[key] === 'object') {
        await this.processObject(obj[key]);
      }
    }

    delete obj.media;
    return obj;
  }
}
