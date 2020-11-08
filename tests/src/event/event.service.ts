import { Injectable } from '@nestjs/common';
import { Model, Document } from 'mongoose';
import { InjectModel } from '../../../lib';
import { CreateClickLinkEventDto } from './dto/create-click-link-event.dto';
import { CreateSignUpEventDto } from './dto/create-sign-up-event.dto';
import { Event } from './schemas/event.schema';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event & Document>,
  ) {}

  async create(
    createCatDto: CreateClickLinkEventDto | CreateSignUpEventDto,
  ): Promise<Event> {
    const createdCat = new this.eventModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }
}
