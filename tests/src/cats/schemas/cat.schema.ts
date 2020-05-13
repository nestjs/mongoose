import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '../../../../lib';

@Schema()
export class Cat extends Document {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;
}

export const CatSchema = SchemaFactory.createForClass(Cat);
