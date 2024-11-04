import { BucketPath } from '@app/modules/aws/s3/enums/bucket-path.enum';

export type S3Notification = {
  Records: Array<{
    eventVersion: string;
    eventSource: string;
    awsRegion: string;
    eventTime: string;
    eventName: string;
    userIdentity: {
      principalId: string;
    };
    requestParameters: {
      sourceIPAddress: string;
    };
    responseElements: {
      'x-amz-request-id': string;
      'x-amz-id-2': string;
    };
    s3: {
      s3SchemaVersion: string;
      configurationId: string;
      bucket: {
        name: BucketPath;
        ownerIdentity: {
          principalId: string;
        };
        arn: string;
      };
      object: {
        key: string;
        size: number;
        eTag: string;
        sequencer: string;
      };
    };
  }>;
};

export type SnsNotificationEvent =
  | {
      Type: 'Notification';
      MessageId: string;
      TopicArn: string;
      Subject: string;
      Message: string;
      Timestamp: string;
      SignatureVersion: string;
      Signature: string;
      SigningCertURL: string;
      UnsubscribeURL: string;
    }
  | {
      Type: 'SubscriptionConfirmation';
      MessageId: string;
      Token: string;
      TopicArn: string;
      Message: string;
      SubscribeURL: string;
      Timestamp: string;
      SignatureVersion: string;
      Signature: string;
      SigningCertURL: string;
    };
