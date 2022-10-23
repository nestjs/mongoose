import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory, Plugin } from '../../../../lib';

export function BirthYearPlugin(
  schema: MongooseSchema,
  options?: { ageKey?: string },
) {
  schema.add({ birthYear: { type: Number } });

  schema.pre('save', function (next) {
    if (!this.birthYear) {
      const ageKey = options?.ageKey ?? 'age';
      this.birthYear = new Date().getFullYear() - (this[ageKey] || 0);
    }
    next();
  });
}

@Plugin(BirthYearPlugin, { ageKey: 'age' })
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
