import { Prop, Schema, SchemaFactory } from '../../../../lib';
import { EventBase, EventBaseSchema, FloodEvent } from './event/event.schema';
import { Document } from 'mongoose';

@Schema({})
export class Region {
  _id: Document['_id'];

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: [EventBaseSchema], default: [], required: true })
  events: EventBase & FloodEvent[];
}

export const RegionSchema = SchemaFactory.createForClass<Region>(Region);
