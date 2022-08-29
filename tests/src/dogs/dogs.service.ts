import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectDynamicModel } from '../../../lib';
import { CreateCatDto } from '../cats/dto/create-cat.dto';
import { Dog } from './schemas/dog.schema';

@Injectable()
export class DogsService {
  constructor(
    @InjectDynamicModel(Dog.name) private readonly dogModel: Model<Dog>,
  ) {}

  async create(createDogDto: CreateCatDto): Promise<Dog> {
    const createdDog = new this.dogModel(createDogDto);

    return this.dogModel.create(createdDog);
  }

  async findAll(): Promise<Dog[]> {
    return this.dogModel.find().exec();
  }
}
