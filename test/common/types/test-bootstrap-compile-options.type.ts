import { ModuleMetadata } from '@nestjs/common';
import { OverrideFunc } from '@test/common/types/override-func.type';

export type TestBootstrapCompileOptions = {
  metadata?: ModuleMetadata;
  overrideFunc?: OverrideFunc;
  disableAppModules?: boolean;
};
