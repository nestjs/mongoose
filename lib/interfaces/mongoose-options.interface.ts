import { ModuleMetadata, Type } from '@nestjs/common';
import { ConnectOptions, MongooseError } from 'mongoose';

export interface MongooseModuleOptions
  extends ConnectOptions,
    Record<string, any> {
  uri?: string;
  retryAttempts?: number;
  retryDelay?: number;
  connectionName?: string;
  connectionFactory?: (connection: any, name: string) => any;
  connectionErrorFactory?: (error: MongooseError) => MongooseError;
  lazyConnection?: boolean;
}

export interface MongooseOptionsFactory {
  createMongooseOptions():
    | Promise<MongooseModuleOptions>
    | MongooseModuleOptions;
}

export interface MongooseModuleFactoryOptions extends Omit<MongooseModuleOptions, 'connectionName'> {}

export interface MongooseModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  connectionName?: string;
  useExisting?: Type<MongooseOptionsFactory>;
  useClass?: Type<MongooseOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<MongooseModuleFactoryOptions> | MongooseModuleFactoryOptions;
  inject?: any[];
}
