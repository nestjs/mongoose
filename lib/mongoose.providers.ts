import { flatten } from '@nestjs/common';
import { Connection, Document, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from './common/mongoose.utils';
import {
  AsyncModelFactory,
  ModelDefinition,
  DiscriminatorOptions,
} from './interfaces';

function addDiscriminators(
  model: Model<Document>,
  discriminators?: DiscriminatorOptions[],
) {
  if (discriminators) {
    for (const { name, schema } of discriminators) {
      model.discriminator(name, schema);
    }
  }
  return model;
}

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
      return addDiscriminators(model, option.discriminators);
    },
    inject: [getConnectionToken(connectionName)],
  }));
  return providers;
}

export function createMongooseAsyncProviders(
  connectionName?: string,
  modelFactories: AsyncModelFactory[] = [],
) {
  const providers = (modelFactories || []).map((option) => [
    {
      provide: getModelToken(option.name),
      useFactory: async (connection: Connection, ...args: unknown[]) => {
        const schema = await option.useFactory(...args);
        const model = connection.model(option.name, schema, option.collection);
        addDiscriminators(model);
        return model;
      },
      inject: [getConnectionToken(connectionName), ...(option.inject || [])],
    },
  ]);
  return flatten(providers);
}
