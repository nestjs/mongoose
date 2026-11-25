import { Provider } from '@nestjs/common';
import { Connection, Document, Error as MongooseError, Model } from 'mongoose';
import {
  getConnectionToken,
  getModelToken,
  getWaitForModelInitToken,
} from './common/mongoose.utils.js';
import {
  AsyncModelFactory,
  DiscriminatorOptions,
  ModelDefinition,
} from './interfaces/index.js';

/**
 * With `waitForModelInit`, waits for `Model.init()` (collection creation and
 * index builds) so that its errors, such as a unique index that cannot be
 * built over duplicates, fail the provider instead of being swallowed by
 * Mongoose.
 *
 * Only done when the connection is already open: on a lazy connection,
 * `Model.init()` waits for the connection without a timeout, so Mongoose
 * keeps initializing the model in the background, as before.
 */
function initModel<T extends { db: Connection; init(): Promise<unknown> }>(
  model: T,
  waitForModelInit: boolean | undefined,
): T | Promise<T> {
  // 1 = ConnectionStates.connected
  if (waitForModelInit && model.db.readyState === 1) {
    return model.init().then(() => model);
  }
  return model;
}

/**
 * Compiles the model, or returns the one compiled by an earlier import of the
 * same feature in the case where Mongoose refuses to compile it again.
 */
function getOrCompileModel(
  connection: Connection,
  name: string,
  schema: ModelDefinition['schema'],
  collection?: string,
) {
  try {
    return connection.model(name, schema, collection);
  } catch (err) {
    if (err instanceof MongooseError.OverwriteModelError) {
      return connection.models[name];
    }
    throw err;
  }
}

/**
 * Registers the discriminator, or returns the one registered by an earlier
 * import of the same feature in the case where Mongoose would throw
 * ("Discriminator with name ... already exists").
 */
function getOrCreateDiscriminator(
  model: Model<Document>,
  discriminator: DiscriminatorOptions,
) {
  const existing = model.discriminators?.[discriminator.name];
  const overwriteModels =
    discriminator.schema.options?.overwriteModels ??
    model.schema.options?.overwriteModels;
  if (existing && !overwriteModels) {
    return existing;
  }
  return model.discriminator(
    discriminator.name,
    discriminator.schema,
    discriminator.value,
  );
}

export function createMongooseProviders(
  connectionName?: string,
  options: ModelDefinition[] = [],
): Provider[] {
  const waitForModelInitToken = {
    token: getWaitForModelInitToken(connectionName),
    optional: true,
  };
  return options.reduce(
    (providers, option) => [
      ...providers,
      ...(option.discriminators || []).map((d) => ({
        provide: getModelToken(d.name, connectionName),
        useFactory: (model: Model<Document>, waitForModelInit?: boolean) =>
          initModel(
            getOrCreateDiscriminator(model, d),
            option.waitForModelInit ?? waitForModelInit,
          ),
        inject: [
          getModelToken(option.name, connectionName),
          waitForModelInitToken,
        ],
      })),
      {
        provide: getModelToken(option.name, connectionName),
        useFactory: (connection: Connection, waitForModelInit?: boolean) => {
          const model = connection.models[option.name]
            ? connection.models[option.name]
            : connection.model(option.name, option.schema, option.collection);
          return initModel(model, option.waitForModelInit ?? waitForModelInit);
        },
        inject: [getConnectionToken(connectionName), waitForModelInitToken],
      },
    ],
    [] as Provider[],
  );
}

export function createMongooseAsyncProviders(
  connectionName?: string,
  modelFactories: AsyncModelFactory[] = [],
): Provider[] {
  const waitForModelInitToken = {
    token: getWaitForModelInitToken(connectionName),
    optional: true,
  };
  return modelFactories.reduce((providers, option) => {
    return [
      ...providers,
      {
        provide: getModelToken(option.name, connectionName),
        useFactory: async (
          connection: Connection,
          waitForModelInit?: boolean,
          ...args: unknown[]
        ) => {
          const schema = await option.useFactory(...args);
          const model = getOrCompileModel(
            connection,
            option.name,
            schema,
            option.collection,
          );
          return initModel(model, option.waitForModelInit ?? waitForModelInit);
        },
        inject: [
          getConnectionToken(connectionName),
          waitForModelInitToken,
          ...(option.inject || []),
        ],
      },
      ...(option.discriminators || []).map((d) => ({
        provide: getModelToken(d.name, connectionName),
        useFactory: (model: Model<Document>, waitForModelInit?: boolean) =>
          initModel(
            getOrCreateDiscriminator(model, d),
            option.waitForModelInit ?? waitForModelInit,
          ),
        inject: [
          getModelToken(option.name, connectionName),
          waitForModelInitToken,
        ],
      })),
    ];
  }, [] as Provider[]);
}
