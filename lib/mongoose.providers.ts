import { flatten } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken, getModelToken } from './common/mongoose.utils';
import { AsyncModelFactory, ModelDefinition } from './interfaces';

export function createMongooseProviders(
  connectionName?: string,
  options: ModelDefinition[] = [],
) {
  const providers = (options || []).map((option) => ({
    provide: getModelToken(option.name),
    useFactory: (connection: Connection) => {
      const model = connection.model(
        option.name,
        option.schema,
        option.collection,
      );
      if (option.discriminators) {
        for (const { name, schema } of option.discriminators) {
          model.discriminator(name, schema);
        }
      }
      return model;
    },
    inject: [getConnectionToken(connectionName)],
  }));
  return providers;
}

export function createMongooseAsyncProviders(
  connectionName?: string,
  modelFactories: AsyncModelFactory[] = [],
) {
  const providers = (modelFactories || []).map((model) => [
    {
      provide: getModelToken(model.name),
      useFactory: async (connection: Connection, ...args: unknown[]) => {
        const schema = await model.useFactory(...args);
        return connection.model(model.name, schema, model.collection);
      },
      inject: [getConnectionToken(connectionName), ...(model.inject || [])],
    },
  ]);
  return flatten(providers);
}
