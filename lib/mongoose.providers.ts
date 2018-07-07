import { Connection, Schema } from 'mongoose';

import { DefaultDbConnectionToken } from './mongoose.constants';
import { getModelToken } from './mongoose.utils';

export function createMongooseProviders(
  connectionName: string = DefaultDbConnectionToken,
  models: { name: string; schema: Schema; collection?: string }[] = [],
) {
  const providers = (models || []).map(model => ({
    provide: getModelToken(model.name),
    useFactory: (connection: Connection) =>
      connection.model(model.name, model.schema, model.collection),
    inject: [connectionName],
  }));
  return providers;
}
