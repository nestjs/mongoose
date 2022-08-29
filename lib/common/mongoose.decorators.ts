import { Inject } from '@nestjs/common';
import {
  getConnectionToken,
  getDynamicModelToken,
  getModelToken,
} from './mongoose.utils';

export const InjectModel = (model: string, connectionName?: string) =>
  Inject(getModelToken(model, connectionName));

export const InjectConnection = (name?: string) =>
  Inject(getConnectionToken(name));

export const InjectDynamicModel = (model: string) =>
  Inject(getDynamicModelToken(model));
