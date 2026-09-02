import { Schema } from 'mongoose';

/**
 * @publicApi
 */
export type DiscriminatorOptions = {
  name: string;
  schema: Schema;
  value?: string;
  /**
   * If `true`, waits for `Model#init()` to resolve before this discriminator
   * model provider is considered ready. Overrides the connection-wide
   * `MongooseModuleOptions#waitForModelInit` default.
   *
   * @default undefined
   */
  waitForModelInit?: boolean;
};

/**
 * @publicApi
 */
export type ModelDefinition = {
  name: string;
  schema: any;
  collection?: string;
  discriminators?: DiscriminatorOptions[];
  /**
   * If `true`, waits for `Model#init()` to resolve before this model
   * provider is considered ready. Overrides the connection-wide
   * `MongooseModuleOptions#waitForModelInit` default.
   *
   * @default undefined
   */
  waitForModelInit?: boolean;
};
