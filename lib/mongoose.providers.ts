import * as mongoose from 'mongoose';

import { getModelToken } from './mongoose.utils';

export function createMongooseProviders(
  models: { name: string; schema: mongoose.Schema }[] = [],
) {
  const providers = (models || []).map((model) => ({
    provide: getModelToken(model.name),
    useFactory: (connection) => connection.model(model.name, model.schema),
    inject: ['DbConnectionToken'],
  }));
  return providers;
}
