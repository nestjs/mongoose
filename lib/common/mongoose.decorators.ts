import { Inject } from '@nestjs/common';
import { DEFAULT_DB_CONNECTION } from '../mongoose.constants';
import { getConnectionToken, getModelToken } from './mongoose.utils';

export const InjectModel = (model: string) => Inject(getModelToken(model));

export const InjectConnection = (name: string) =>
  Inject(name ? getConnectionToken(name) : DEFAULT_DB_CONNECTION);
