import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '../../../../lib';

@Schema()
export class Dog extends Document {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;
}

export const DogSchema = SchemaFactory.createForClass(Dog);
