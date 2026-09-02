import { ModuleMetadata, Type } from '@nestjs/common';
import { ConnectOptions, Connection, MongooseError } from 'mongoose';

/**
 * @publicApi
 */
export interface MongooseModuleOptions extends ConnectOptions {
  uri?: string;
  retryAttempts?: number;
  retryDelay?: number;
  connectionName?: string;
  connectionFactory?: (connection: any, name: string) => any;
  connectionErrorFactory?: (error: MongooseError) => MongooseError;
  lazyConnection?: boolean;
  onConnectionCreate?: (connection: Connection) => void;
  /**
   * If `true`, will show verbose error messages on each connection retry.
   */
  verboseRetryLog?: boolean;
  /**
   * If `true`, model injection (via `@InjectModel()`) will wait for
   * `Model#init()` to resolve before the model provider is considered
   * ready, ensuring index building and other initialization has completed
   * before the model can be used. Can be overridden per model via
   * `ModelDefinition#waitForModelInit` or `AsyncModelFactory#waitForModelInit`.
   *
   * @default false
   */
  waitForModelInit?: boolean;
}

/**
 * @publicApi
 */
export interface MongooseOptionsFactory {
  createMongooseOptions():
    | Promise<MongooseModuleOptions>
    | MongooseModuleOptions;
}

/**
 * @publicApi
 */
export type MongooseModuleFactoryOptions = Omit<
  MongooseModuleOptions,
  'connectionName'
>;

/**
 * @publicApi
 */
export interface MongooseModuleAsyncOptions extends Pick<
  ModuleMetadata,
  'imports'
> {
  connectionName?: string;
  useExisting?: Type<MongooseOptionsFactory>;
  useClass?: Type<MongooseOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<MongooseModuleFactoryOptions> | MongooseModuleFactoryOptions;
  inject?: any[];
}
