import { NestExpressApplication } from '@nestjs/platform-express';
import { TestingModule } from '@nestjs/testing';
import request, { Test as SuperTestTest } from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { MiddlewareSetup } from '@app/config/setups/middleware.setup';

export class TestNestExpress {
  express: NestExpressApplication;

  constructor(private readonly testingModule: TestingModule) {
    this.express = this.testingModule.createNestApplication<NestExpressApplication>({
      logger: ['debug'],
    });
  }

  static async createNestExpressApplication(testingModule: TestingModule): Promise<TestNestExpress> {
    const instance = new TestNestExpress(testingModule);
    new MiddlewareSetup(instance.express).init();
    await instance.express.init();
    return instance;
  }

  request(): TestAgent<SuperTestTest> {
    if (!this.express) {
      throw new Error(
        `Nest Express application not started! Please set the [express.start = true] on compile method options!`,
      );
    }
    return request(this.express.getHttpServer());
  }
}
