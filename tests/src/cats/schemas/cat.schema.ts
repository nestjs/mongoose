import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory, Plugin } from '../../../../lib';

export function BirthYearPlugin(schema: MongooseSchema) {
  schema.virtual('birthYear').get(function () {
    return new Date().getFullYear() - (this.age || 0);
  });
}

@Plugin(BirthYearPlugin)
@Schema()
export class Cat extends Document {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;

  birthYear: number;
}

export const CatSchema = SchemaFactory.createForClass(Cat);
