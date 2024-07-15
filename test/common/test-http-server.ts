import { NestExpressApplication } from '@nestjs/platform-express';
import { TestingModule } from '@nestjs/testing';
import request, { Test as SuperTestTest } from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { MiddlewareSetup } from '@app/config/setups/middleware.setup';

export class TestHttpServer {
  httpServer: NestExpressApplication;

  constructor(private readonly testingModule: TestingModule) {
    this.httpServer = this.testingModule.createNestApplication<NestExpressApplication>();
  }

  static async createHttpServer(testingModule: TestingModule): Promise<TestHttpServer> {
    const instance = new TestHttpServer(testingModule);
    new MiddlewareSetup(instance.httpServer).init();
    await instance.httpServer.init();
    return instance;
  }

  request(): TestAgent<SuperTestTest> {
    if (!this.httpServer) {
      throw new Error('HttpServer not initialized');
    }

    return request(this.httpServer.getHttpServer());
  }
}
