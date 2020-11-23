import { Provider } from '@nestjs/common';
import { Connection, Document, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from './common/mongoose.utils';
import {
  AsyncModelFactory,
  ModelDefinition,
  DiscriminatorOptions,
} from './interfaces';

function addDiscriminators(
  model: Model<Document>,
  discriminators: DiscriminatorOptions[] = [],
): Model<Document>[] {
  return discriminators.map(({ name, schema }) =>
    model.discriminator(name, schema),
  );
}

export function createMongooseProviders(
  connectionName?: string,
  options: ModelDefinition[] = [],
): Provider[] {
  return options.reduce(
    (providers, option) => [
      ...providers,
      ...createMongooseProviders(connectionName, option.discriminators),
      {
        provide: getModelToken(option.name),
        useFactory: (connection: Connection) => {
          const model = connection.model(
            option.name,
            option.schema,
            option.collection,
          );
          addDiscriminators(model, option.discriminators);
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
        provide: getModelToken(option.name),
        useFactory: async (connection: Connection, ...args: unknown[]) => {
          const schema = await option.useFactory(...args);
          const model = connection.model(
            option.name,
            schema,
            option.collection,
          );
          addDiscriminators(model, option.discriminators);
          return model;
        },
        inject: [getConnectionToken(connectionName), ...(option.inject || [])],
      },
      // discriminators must convert to `AsyncModelFactory`.
      // Otherwise, the discriminators will register as `Model` before `model.discriminator` and throw OverwriteModelError
      ...createMongooseAsyncProviders(
        connectionName,
        (option.discriminators || []).map<AsyncModelFactory>(
          ({ name, schema }) => ({ name, useFactory: async () => schema }),
        ),
      ),
    ];
  }, [] as Provider[]);
}
