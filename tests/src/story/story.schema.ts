import { HydratedDocument } from 'mongoose';
import { Prop, Ref, Schema, SchemaFactory } from '../../../lib';
import { Person } from '../person/person.schema';

export type StoryDocument = HydratedDocument<Story>;

@Schema()
export class Story {
  @Prop({ type: String, ref: () => Person })
  author: Ref<Person, string>;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [{ type: String, ref: () => Person }] })
  fans: Ref<Person, string>[];
}

export const StorySchema = SchemaFactory.createForClass(Story);
