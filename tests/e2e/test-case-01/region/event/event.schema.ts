import { Prop, Schema, SchemaFactory } from '../../../../../lib';

@Schema()
export class FloodEvent {
  kind: 'flood';

  @Prop({ type: String, required: true })
  reason: string;
}

@Schema({ timestamps: true, discriminatorKey: 'kind' })
export class EventBase {
  @Prop({ type: String, enum: ['flood'], required: true })
  kind: string;
}

export const EventBaseSchema = SchemaFactory.createForClass<EventBase>(
  EventBase,
);
export const FloodSchema = SchemaFactory.createForClass<FloodEvent>(FloodEvent);
