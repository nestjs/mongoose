import { Model, Schema as MongooseSchema, Types } from 'mongoose';
import { expectTypeOf } from 'vitest';
import { ModelWithSchema, Prop, Schema, SchemaFactory } from '../../lib';

@Schema()
class Cat {
  @Prop()
  name: string;

  @Prop()
  age: number;
}

const CatSchema = SchemaFactory.createForClass(Cat);

declare const catModel: ModelWithSchema<Cat>;
declare const plainModel: Model<Cat>;

describe('ModelWithSchema', () => {
  // see https://github.com/nestjs/mongoose/issues/2852
  it('should keep the "schema" property typed under mongoose@9', () => {
    expectTypeOf(catModel.schema).not.toBeAny();
    expectTypeOf(catModel.schema).toEqualTypeOf<MongooseSchema<Cat>>();
    expectTypeOf(catModel.schema.obj).not.toBeAny();
    expectTypeOf(catModel.schema.paths).not.toBeAny();
  });

  it('should accept the schema created by SchemaFactory', () => {
    const schema: ModelWithSchema<Cat>['schema'] = CatSchema;
    expectTypeOf(schema).toEqualTypeOf<MongooseSchema<Cat>>();
  });

  it('should stay interchangeable with Model<T>', () => {
    const asPlain: Model<Cat> = catModel;
    const asTyped: ModelWithSchema<Cat> = plainModel;
    expectTypeOf(asPlain).not.toBeNever();
    expectTypeOf(asTyped).not.toBeNever();
  });

  it('should leave the query surface unchanged', () => {
    expectTypeOf(catModel.findOne()).toEqualTypeOf(plainModel.findOne());
    expectTypeOf(new catModel()).toEqualTypeOf(new plainModel());
    expectTypeOf(new catModel()._id).toEqualTypeOf<Types.ObjectId>();
  });

  it('should accept query helpers, methods, and virtuals generics', () => {
    type WithExtras = ModelWithSchema<
      Cat,
      { byName(name: string): unknown },
      { meow(): string },
      { nameUpper: string }
    >;
    expectTypeOf<WithExtras['schema']>().toEqualTypeOf<MongooseSchema<Cat>>();
  });

  it('documents the mongoose@9 default this type works around', () => {
    expectTypeOf<Model<Cat>['schema']>().toBeAny();
  });
});
