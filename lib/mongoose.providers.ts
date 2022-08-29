import { Provider, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Connection, Document, Model } from 'mongoose';
import {
  getConnectionToken,
  getDynamicModelToken,
  getModelToken,
} from './common/mongoose.utils';
import {
  AsyncModelFactory,
  CreateMongooseDynamicProviders,
  ModelDefinition,
  MongooseDynamicConnection,
} from './interfaces';
import { MONGOOSE_DYNAMIC_CONNECTION } from './mongoose.constants';

export function createMongooseProviders(
  connectionName?: string,
  options: ModelDefinition[] = [],
): Provider[] {
  return options.reduce(
    (providers, option) => [
      ...providers,
      ...(option.discriminators || []).map((d) => ({
        provide: getModelToken(d.name, connectionName),
        useFactory: (model: Model<Document>) =>
          model.discriminator(d.name, d.schema, d.value),
        inject: [getModelToken(option.name, connectionName)],
      })),
      {
        provide: getModelToken(option.name, connectionName),
        useFactory: (connection: Connection) => {
          const model = connection.model(
            option.name,
            option.schema,
            option.collection,
          );
          return model;
        },
        inject: [getConnectionToken(connectionName)],
      },
    ],
    [] as Provider[],
  );
}

export function createMongooseAsyncProviders(
  connectionName?: string,
  modelFactories: AsyncModelFactory[] = [],
): Provider[] {
  return modelFactories.reduce((providers, option) => {
    return [
      ...providers,
      {
        provide: getModelToken(option.name, connectionName),
        useFactory: async (connection: Connection, ...args: unknown[]) => {
          const schema = await option.useFactory(...args);
          const model = connection.model(
            option.name,
            schema,
            option.collection,
          );
          return model;
        },
        inject: [getConnectionToken(connectionName), ...(option.inject || [])],
      },
      ...(option.discriminators || []).map((d) => ({
        provide: getModelToken(d.name, connectionName),
        useFactory: (model: Model<Document>) =>
          model.discriminator(d.name, d.schema, d.value),
        inject: [getModelToken(option.name, connectionName)],
      })),
    ];
  }, [] as Provider[]);
}

export function createMongooseDynamicProviders({
  models: options,
  resolverKey,
  factory,
}: CreateMongooseDynamicProviders): Provider[] {
  return options.reduce((providers, option) => {
    const resolver = resolverKey ?? ((...req) => req[0].headers?.origin);

    const useFactory = async (
      pool: MongooseDynamicConnection,
      ...any: any[]
    ) => {
      const conn = await pool.get(resolver(...any));
      if (conn.models[option.name]) return conn.models[option.name];

      const model = conn.model(option.name, option.schema, option.collection);

      return model;
    };

    return [
      ...providers,
      {
        provide: getDynamicModelToken(option.name),
        useFactory: factory?.useFactory ?? useFactory,
        scope: Scope.REQUEST,
        inject: [
          MONGOOSE_DYNAMIC_CONNECTION,
          ...(factory?.inject ?? [REQUEST]),
        ],
      },
    ];
  }, [] as Provider[]);
}
