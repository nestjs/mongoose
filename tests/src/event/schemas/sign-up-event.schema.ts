import { Prop, Schema, SchemaFactory } from '../../../../lib';
import { Event } from './event.schema';

@Schema({})
export class SignUpEvent implements Event {
  kind: string;

  time: Date;

  @Prop({ type: String, required: true })
  user: string;
}

export const SignUpEventSchema = SchemaFactory.createForClass(SignUpEvent);
