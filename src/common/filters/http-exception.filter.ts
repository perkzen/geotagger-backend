import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class HttpExceptionFilter implements HttpExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage: string | object = 'Internal server error';
    let errorCode: string = 'UNKNOWN_ERROR';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      errorMessage = exception.getResponse()?.['message'] || exception.getResponse();
      errorCode = exception.getResponse()?.['code'];
    }

    if (exception instanceof Error && !errorMessage) {
      errorMessage = exception.message;
    }

    const response = {
      statusCode: httpStatus,
      code: errorCode,
      error: errorMessage,
    };

    Logger.error(
      `${ctx.getRequest().method} ${ctx.getRequest().url} (Status:${httpStatus} Error:${JSON.stringify(errorMessage)})`,
      '',
      'HttpExceptionFilter',
    );

    httpAdapter.reply(ctx.getResponse(), response, httpStatus);
  }
}
