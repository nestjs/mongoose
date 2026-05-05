import { Prop, Schema, SchemaFactory } from '../../../../lib/index.js';
import { Event } from './event.schema.js';

@Schema({})
export class ClickLinkEvent implements Event {
  kind: string;

  time: Date;

  @Prop({ type: String, required: true })
  url: string;
}

export const ClieckLinkEventSchema = SchemaFactory.createForClass(
  ClickLinkEvent,
);
