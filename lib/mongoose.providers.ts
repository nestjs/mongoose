import { Provider } from '@nestjs/common';
import { Connection, Document, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from './common/mongoose.utils';
import { AsyncModelFactory, ModelDefinition } from './interfaces';

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
