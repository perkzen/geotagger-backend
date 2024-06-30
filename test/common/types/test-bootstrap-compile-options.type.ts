import { ModuleMetadata } from '@nestjs/common';
import { OverrideFunc } from '@test/common/types/override-func.type';
import { TestExpressOptions } from '@test/common/types/test-express-options.type';

export type TestBootstrapCompileOptions = {
  metadata?: ModuleMetadata;
  overrideFunc?: OverrideFunc;
  disableAppModules?: boolean;
  express?: TestExpressOptions;
};
