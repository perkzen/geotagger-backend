import { HelloWorldTemplateData } from '@app/modules/email/template-data/hello-world.template-data';
import { ResetPasswordTemplateData } from '@app/modules/email/template-data/reset-password.template-data';

export enum EmailTemplate {
  HELLO_WORLD = 'hello-world',
  RESET_PASSWORD = 'reset-password',
}

type TemplateDataMap = {
  [EmailTemplate.HELLO_WORLD]: HelloWorldTemplateData;
  [EmailTemplate.RESET_PASSWORD]: ResetPasswordTemplateData;
};

export type TemplateData<T extends EmailTemplate> = T extends keyof TemplateDataMap ? TemplateDataMap[T] : never;
