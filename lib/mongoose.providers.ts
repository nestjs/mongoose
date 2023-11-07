import { Provider } from '@nestjs/common';
import { Connection, Document, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from './common/mongoose.utils';
import { AsyncModelFactory, ModelDefinition } from './interfaces';

export function createMongooseProviders(
  connectionName?: string,
  options: ModelDefinition[] = [],
): Provider[] {
  return options.reduce((providers, option) => {
    const connectionToken = getConnectionToken(connectionName);
    const modelToken = getModelToken(option.name, connectionName);

    const modelFactory = (connection: Connection) => {
      const model = connection.models[option.name]
        ? connection.models[option.name]
        : connection.model(option.name, option.schema, option.collection);

      return model;
    };

    return [
      ...providers,
      ...(option.discriminators || []).flatMap((d) => [
        {
          provide: getModelToken(d.name),
          useFactory: (model: Model<Document>) =>
            model.discriminator(d.name, d.schema, d.value),
          inject: [modelToken],
        },
        {
          provide: getModelToken(d.name, connectionName),
          useFactory: (model: Model<Document>) =>
            model.discriminator(d.name, d.schema, d.value),
          inject: [modelToken],
        },
      ]),
      {
        provide: getModelToken(option.name),
        useFactory: modelFactory,
        inject: [connectionToken],
      },
      {
        provide: modelToken,
        useFactory: modelFactory,
        inject: [connectionToken],
      },
    ];
  }, [] as Provider[]);
}

export function createMongooseAsyncProviders(
  connectionName?: string,
  modelFactories: AsyncModelFactory[] = [],
): Provider[] {
  return modelFactories.reduce((providers, option) => {
    const connectionToken = getConnectionToken(connectionName);
    const modelToken = getModelToken(option.name, connectionName);

    const modelFactory = async (connection: Connection, ...args: unknown[]) => {
      const schema = await option.useFactory(...args);
      const model = connection.model(option.name, schema, option.collection);
      return model;
    };

    return [
      ...providers,
      {
        provide: modelToken,
        useFactory: modelFactory,
        inject: [connectionToken, ...(option.inject || [])],
      },
      {
        provide: getModelToken(option.name),
        useFactory: modelFactory,
        inject: [connectionToken, ...(option.inject || [])],
      },
      ...(option.discriminators || []).flatMap((d) => [
        {
          provide: getModelToken(d.name, connectionName),
          useFactory: (model: Model<Document>) =>
            model.discriminator(d.name, d.schema, d.value),
          inject: [modelToken],
        },
        {
          provide: getModelToken(d.name),
          useFactory: (model: Model<Document>) =>
            model.discriminator(d.name, d.schema, d.value),
          inject: [modelToken],
        },
      ]),
    ];
  }, [] as Provider[]);
}
