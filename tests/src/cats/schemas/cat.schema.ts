import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '../../../../lib';

@Schema()
export class Cat extends Document {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;

  // see https://github.com/nestjs/mongoose/issues/2421
  @Prop({
    type: [{ type: Types.ObjectId, ref: Cat.name }],
    default: [],
  })
  kitten: Types.ObjectId[];
}

export const CatSchema = SchemaFactory.createForClass(Cat);
