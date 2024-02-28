import { Injectable } from '@nestjs/common';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { InjectModel } from '../../../lib';
import { CreateCatDto, UpdateCatDto } from './dto';
import { Cat } from './schemas/cat.schema';

@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name) private readonly catModel: Model<Cat>) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async update(updateCat: UpdateCatDto): Promise<UpdateWriteOpResult> {
    const filter = { name: updateCat.name };
    const updatedCat = this.catModel.updateOne(filter, updateCat);
    return updatedCat;
  }

  async findAll(): Promise<Cat[]> {
    return this.catModel.find().exec();
  }
}
