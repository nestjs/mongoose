import * as mongoose from 'mongoose';

import { getModelToken } from './mongoose.utils';

export function createMongooseProviders(
  uri: string,
  options: mongoose.ConnectionOptions = { useMongoClient: true },
  models: { name: string, schema: mongoose.Schema }[] = [],
) {
  const connectionProvider = {
    provide: 'DbConnectionToken',
    useFactory: async (): Promise<mongoose.Connection> => {
      (mongoose as any).Promise = global.Promise;
      return await mongoose.connect(uri, options);
    },
  };

  const providers = (models || []).map(model => ({
    provide: getModelToken(model.schema),
    useFactory: (connection) => connection.model(model.name, model.schema),
    inject: ['DbConnectionToken'],
  }));
  return [connectionProvider, ...providers];
}
