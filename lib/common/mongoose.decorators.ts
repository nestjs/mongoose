import { Inject } from '@nestjs/common';
import { getConnectionToken, getModelToken } from './mongoose.utils';

export const InjectModel = (model: string, connectionName?: string) => Inject(getModelToken(model, connectionName));

export const InjectConnection = (name?: string) =>
  Inject(getConnectionToken(name));
