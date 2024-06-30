import { TestingModuleBuilder } from '@nestjs/testing';

export type OverrideFunc = (module: TestingModuleBuilder) => TestingModuleBuilder;
