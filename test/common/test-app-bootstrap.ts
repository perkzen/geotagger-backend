import { ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '@app/app.module';
import { PrismaService } from '@app/modules/db/prisma.service';
import { TestNestExpress } from '@test/common/test-nest-express-app';
import { OverrideFunc } from '@test/common/types/override-func.type';
import { TestBootstrapCompileOptions } from '@test/common/types/test-bootstrap-compile-options.type';

export class TestAppBootstrap {
  moduleBuilder: TestingModuleBuilder;
  app: TestingModule;
  express: TestNestExpress;
  db: PrismaService;

  constructor() {}

  async compile(options?: TestBootstrapCompileOptions): Promise<TestingModule> {
    const { metadata = {}, overrideFunc = undefined, disableAppModules = false } = { ...options };
    const { start: expressStart = true } = { ...options?.express };

    if (!this.moduleBuilder) {
      this.createBuilder(metadata, overrideFunc, !disableAppModules);
    }

    this.app = await this.moduleBuilder.compile();

    this.db = this.app.get<PrismaService>(PrismaService);

    if (expressStart) {
      this.express = await TestNestExpress.createNestExpressApplication(this.app);
    }

    return this.app;
  }

  async close(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }

    if (this.db) {
      await this.clearDatabase();
      await this.db.$disconnect();
    }
  }

  private createBuilder(
    metadata: ModuleMetadata,
    overrideFunc?: OverrideFunc,
    loadAppModules: boolean = true,
  ): TestAppBootstrap {
    if (!metadata.imports) {
      metadata.imports = [];
    }
    if (loadAppModules) {
      metadata.imports.push(AppModule);
    }

    this.moduleBuilder = Test.createTestingModule({ ...metadata });

    if (overrideFunc) {
      overrideFunc(this.moduleBuilder);
    }

    return this;
  }

  private async clearDatabase(): Promise<void> {
    const tableNames = await this.db.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public';
    `;

    for (const { tablename } of tableNames) {
      if (tablename !== '_prisma_migrations') {
        await this.db.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
      }
    }
  }
}
