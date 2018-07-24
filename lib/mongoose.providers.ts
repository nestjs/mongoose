import * as mongoose from 'mongoose';
import { DefaultDbConnectionToken } from './mongoose.constants';
import { getModelToken } from './mongoose.utils';

export function createMongooseProviders(
  connectionName: string = DefaultDbConnectionToken,
  models: { name: string; schema: mongoose.Schema }[] = [],
) {
  const providers = (models || []).map(model => ({
    provide: getModelToken(model.name),
    useFactory: connection => connection.model(model.name, model.schema),
    inject: [connectionName],
  }));
  return providers;
}
