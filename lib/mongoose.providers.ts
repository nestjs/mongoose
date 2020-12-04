import { Provider } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken, getModelToken } from './common/mongoose.utils';
import { AsyncModelFactory, ModelDefinition } from './interfaces';

export function createMongooseProviders(
  connectionName?: string,
  options: ModelDefinition[] = [],
): Provider[] {
  return options.reduce(
    (providers, option) => [
      ...providers,
      {
        provide: getModelToken(option.name),
        useFactory: (connection: Connection) => {
          const model = connection.model(
            option.name,
            option.schema,
            option.collection,
          );
          (option.discriminators || []).forEach(({ name, schema }) =>
            model.discriminator(name, schema),
          );
          return model;
        },
        inject: [getConnectionToken(connectionName)],
      },
      // Deferring the creation of the providers for the model of each
      //    discriminator, using factory, so it is created after the
      //    provider for the parent model is able to register it.
      // This prevents 'OverwriteModelError'.
      ...createMongooseAsyncProviders(
        connectionName,
        (option.discriminators || []).map<AsyncModelFactory>(
          ({ name, schema }) => ({ name, useFactory: async () => schema }),
        ),
      ),
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
          (option.discriminators || []).forEach(({ name, schema }) =>
            model.discriminator(name, schema),
          );
          return model;
        },
        inject: [getConnectionToken(connectionName), ...(option.inject || [])],
      },
      // Deferring the creation of the providers for the model of each
      //    discriminator, using factory, so it is created after the
      //    provider for the parent model is able to register it.
      // This prevents 'OverwriteModelError'.
      ...createMongooseAsyncProviders(
        connectionName,
        (option.discriminators || []).map<AsyncModelFactory>(
          ({ name, schema }) => ({ name, useFactory: async () => schema }),
        ),
      ),
    ];
  }, [] as Provider[]);
}
