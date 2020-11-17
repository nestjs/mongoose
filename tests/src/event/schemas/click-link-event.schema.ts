import { Prop, Schema, SchemaFactory } from '../../../../lib';
import { Event } from './event.schema';

@Schema({})
export class ClieckLinkEvent implements Event {
  kind: string;

  time: Date;

  @Prop({ type: String, required: true })
  url: string;
}

export const ClieckLinkEventSchema = SchemaFactory.createForClass(
  ClieckLinkEvent,
);
