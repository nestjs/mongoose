import { Connection, Schema } from 'mongoose';
import { getConnectionToken, getModelToken } from './common/mongoose.utils';

export function createMongooseProviders(
  connectionName?: string,
  models: { name: string; schema: Schema; collection?: string }[] = [],
) {
  const providers = (models || []).map(model => ({
    provide: getModelToken(model.name),
    useFactory: (connection: Connection) =>
      connection.model(model.name, model.schema, model.collection),
    inject: [getConnectionToken(connectionName)],
  }));
  return providers;
}
