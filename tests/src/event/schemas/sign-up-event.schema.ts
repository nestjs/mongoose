import { Prop, Schema, SchemaFactory } from '../../../../lib/index.js';
import { Event } from './event.schema.js';

@Schema({})
export class SignUpEvent implements Event {
  kind: string;

  time: Date;

  @Prop({ type: String, required: true })
  user: string;
}

export const SignUpEventSchema = SchemaFactory.createForClass(SignUpEvent);
