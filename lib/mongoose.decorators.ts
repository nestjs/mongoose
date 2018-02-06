import * as mongoose from 'mongoose';
import { Inject } from '@nestjs/common';

import { getModelToken } from './mongoose.utils';

export const InjectModel = (model: string) =>
  Inject(getModelToken(model));
