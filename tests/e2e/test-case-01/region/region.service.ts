import { Injectable, NotFoundException } from '@nestjs/common';
import { Document, Model } from 'mongoose';
import { InjectModel } from '../../../../lib';
import { Region } from './region.schema';
import { /*EventBase,*/ FloodEvent } from './event/event.schema';

@Injectable()
export class RegionService {
  constructor(
    @InjectModel(Region.name) private region: Model<Region & Document>,
    // @InjectModel(EventBase.name) private event: Model<EventBase & Document>,
    @InjectModel(FloodEvent.name) private flood: Model<FloodEvent & Document>,
  ) {}

  async getRegion(id: Document['_id']): Promise<Region> {
    const region = await this.region.findById(id);
    if (!region) throw new NotFoundException();
    return region.toObject();
  }

  async create(name: Region['name']) {
    const created = await new this.region({ name }).save();
    return await this.getRegion(created._id);
  }

  async getAll(): Promise<Region[]> {
    return await this.region.find({});
  }

  async addFloodEventToRegion(
    id: Document['_id'],
    event: Omit<FloodEvent, '_id' | 'updatedAt' | 'createdAt' | 'kind'>,
  ) {
    let region = await this.region.findById(id);

    if (!region) throw new NotFoundException();

    region.events.push(new this.flood(event));

    await region.save({ validateBeforeSave: true });

    return await this.getRegion(id);
  }
}
