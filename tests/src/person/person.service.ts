import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '../../../lib';
import { Person, PersonDocument } from './person.schema';

@Injectable()
export class PersonService {
  constructor(
    @InjectModel(Person.name) readonly model: Model<PersonDocument>,
  ) {}
}
