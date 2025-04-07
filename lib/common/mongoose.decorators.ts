import { Inject } from '@nestjs/common';
import { getConnectionToken, getModelToken } from './mongoose.utils';

/**
 * @publicApi
 */
export const InjectModel = (model: string, connectionName?: string) =>
  Inject(getModelToken(model, connectionName));

/**
 * @publicApi
 */
export const InjectConnection = (name?: string) =>
  Inject(getConnectionToken(name));
