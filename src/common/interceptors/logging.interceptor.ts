import { CallHandler, ExecutionContext, NestInterceptor, Logger as NestLogger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap(() =>
          NestLogger.log(
            `${request.method} ${request.url} ${response.statusCode} ${Date.now() - now}ms`,
            context.getClass().name,
          ),
        ),
      );
  }
}
