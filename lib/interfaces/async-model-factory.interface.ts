import { ModuleMetadata } from '@nestjs/common';
import { ModelDefinition } from './model-definition.interface';

/**
 * @publicApi
 */
export interface AsyncModelFactory
  extends Pick<ModuleMetadata, 'imports'>,
    Pick<ModelDefinition, 'name' | 'collection' | 'discriminators'> {
  useFactory: (
    ...args: any[]
  ) => ModelDefinition['schema'] | Promise<ModelDefinition['schema']>;
  inject?: any[];
}
