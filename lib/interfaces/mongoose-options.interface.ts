import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';
import { Connection, ConnectOptions } from 'mongoose';
import { ModelDefinition } from './model-definition.interface';

export interface MongooseModuleOptions
  extends ConnectOptions,
    Record<string, any> {
  uri?: string;
  retryAttempts?: number;
  retryDelay?: number;
  connectionName?: string;
  connectionFactory?: (connection: any, name: string) => any;
}

export interface MongooseOptionsFactory {
  createMongooseOptions():
    | Promise<MongooseModuleOptions>
    | MongooseModuleOptions;
}

export type MongooseModuleFactoryOptions = Omit<
  MongooseModuleOptions,
  'connectionName'
>;

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

export interface MongooseModuleDynamicConnectionOptions {
  options?: Omit<MongooseModuleOptions, 'connectionName'>;
  resolver(dynamicKey: string): string | { uri: string; dbName?: string };
}

export interface MongooseDynamicConnection {
  get(dynamicKey: string): Promise<Connection>;
  closeAll(conns: Map<string, Connection>): void;
}

export interface CreateMongooseDynamicProviders {
  models: ModelDefinition[];
  factory?: Omit<FactoryProvider, 'provide' | 'scope' | 'durable'>;
  resolverKey?: (...any: any[]) => string;
}
