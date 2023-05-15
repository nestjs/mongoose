import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '../../../lib';

export type PersonDocument = HydratedDocument<Person>;

@Schema({ _id: false })
export class Person {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })
  name: string;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
