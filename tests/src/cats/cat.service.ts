import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '../../../lib/index.js';
import { Cat } from './schemas/cat.schema.js';

@Injectable()
export class CatService {
  constructor(@InjectModel(Cat.name) private readonly catModel: Model<Cat>) {}

  async findOne(id: string): Promise<Cat | null> {
    return this.catModel.findById(id).populate('kitten').exec();
  }
}
