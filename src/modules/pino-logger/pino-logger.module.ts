import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule, Params } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<Params> => {
        const pinoLogRequests = configService.get('PINO_LOG_REQUESTS');
        const pinoLogLevel = configService.get('PINO_LOG_LEVEL');
        const pinoEnablePrettyPrint = configService.get('PINO_ENABLE_PRETTY_PRINT');
        const pinoQuietReq = configService.get('PINO_QUIET_REQ');

        return {
          pinoHttp: {
            autoLogging: pinoLogRequests,
            level: pinoLogLevel,
            transport: pinoEnablePrettyPrint ? { target: 'pino-pretty', options: { singleLine: true } } : undefined,
            quietReqLogger: pinoQuietReq,
          },
        };
      },
    }),
  ],
})
export class PinoLoggerModule {}
