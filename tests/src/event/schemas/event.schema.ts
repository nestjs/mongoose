import { Prop, Schema, SchemaFactory } from '../../../../lib/index.js';
import { ClickLinkEvent } from './click-link-event.schema.js';
import { SignUpEvent } from './sign-up-event.schema.js';

@Schema({ discriminatorKey: 'kind' })
export class Event {
  @Prop({
    type: String,
    required: true,
    enum: [ClickLinkEvent.name, SignUpEvent.name],
  })
  kind: string;

  @Prop({ type: Date, required: true })
  time: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
