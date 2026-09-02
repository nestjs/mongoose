import { Provider } from '@nestjs/common';
import { Connection, Document, Model } from 'mongoose';
import {
  getConnectionToken,
  getModelToken,
  getModuleOptionsToken,
} from './common/index.js';
import {
  AsyncModelFactory,
  ModelDefinition,
  MongooseModuleOptions,
} from './interfaces/index.js';

async function initModelIfNeeded<
  TModel extends { init: () => Promise<unknown> },
>(
  model: TModel,
  waitForModelInit: boolean | undefined,
  moduleOptions: MongooseModuleOptions | undefined,
): Promise<TModel> {
  if (waitForModelInit ?? moduleOptions?.waitForModelInit) {
    await model.init();
  }
  return model;
}

export function createMongooseProviders(
  connectionName?: string,
  options: ModelDefinition[] = [],
): Provider[] {
  return options.reduce(
    (providers, option) => [
      ...providers,
      ...(option.discriminators || []).map((d) => ({
        provide: getModelToken(d.name, connectionName),
        useFactory: (
          model: Model<Document>,
          moduleOptions: MongooseModuleOptions,
        ) =>
          initModelIfNeeded(
            model.discriminator(d.name, d.schema, d.value),
            d.waitForModelInit,
            moduleOptions,
          ),
        inject: [
          getModelToken(option.name, connectionName),
          getModuleOptionsToken(connectionName),
        ],
      })),
      {
        provide: getModelToken(option.name, connectionName),
        useFactory: (
          connection: Connection,
          moduleOptions: MongooseModuleOptions,
        ) => {
          const model = connection.models[option.name]
            ? connection.models[option.name]
            : connection.model(option.name, option.schema, option.collection);
          return initModelIfNeeded(
            model,
            option.waitForModelInit,
            moduleOptions,
          );
        },
        inject: [
          getConnectionToken(connectionName),
          getModuleOptionsToken(connectionName),
        ],
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
        useFactory: async (
          connection: Connection,
          moduleOptions: MongooseModuleOptions,
          ...args: unknown[]
        ) => {
          const schema = await option.useFactory(...args);
          const model = connection.model(
            option.name,
            schema,
            option.collection,
          );
          return initModelIfNeeded(
            model,
            option.waitForModelInit,
            moduleOptions,
          );
        },
        inject: [
          getConnectionToken(connectionName),
          getModuleOptionsToken(connectionName),
          ...(option.inject || []),
        ],
      },
      ...(option.discriminators || []).map((d) => ({
        provide: getModelToken(d.name, connectionName),
        useFactory: (
          model: Model<Document>,
          moduleOptions: MongooseModuleOptions,
        ) =>
          initModelIfNeeded(
            model.discriminator(d.name, d.schema, d.value),
            d.waitForModelInit,
            moduleOptions,
          ),
        inject: [
          getModelToken(option.name, connectionName),
          getModuleOptionsToken(connectionName),
        ],
      })),
    ];
  }, [] as Provider[]);
}
