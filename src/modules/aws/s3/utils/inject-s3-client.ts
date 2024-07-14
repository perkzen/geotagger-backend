import { Inject } from '@nestjs/common';
import { AWS_S3_CLIENT } from '@app/modules/aws/aws.constants';

export function InjectS3Client(): PropertyDecorator & ParameterDecorator {
  return Inject(AWS_S3_CLIENT);
}
