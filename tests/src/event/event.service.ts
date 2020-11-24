import { Injectable } from '@nestjs/common';
import { Document, Model } from 'mongoose';
import { InjectModel } from '../../../lib';
import { CreateClickLinkEventDto } from './dto/create-click-link-event.dto';
import { CreateSignUpEventDto } from './dto/create-sign-up-event.dto';
import { ClickLinkEvent } from './schemas/click-link-event.schema';
import { Event } from './schemas/event.schema';
import { SignUpEvent } from './schemas/sign-up-event.schema';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event & Document>,

    @InjectModel(ClickLinkEvent.name)
    private readonly clickEventModel: Model<Event & Document>,

    @InjectModel(SignUpEvent.name)
    private readonly signUpEventModel: Model<Event & Document>,
  ) {}

  async create(
    createDto: CreateClickLinkEventDto | CreateSignUpEventDto,
  ): Promise<Event> {
    const createdEvent = new this.eventModel(createDto);
    return createdEvent.save();
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }
}
