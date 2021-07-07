import { Prop, Schema, SchemaFactory } from '../../lib';

@Schema({ validateBeforeSave: false, _id: true, autoIndex: true })
class ChildClass {
  @Prop()
  id: number;

  @Prop()
  name: string;
}

@Schema({
  validateBeforeSave: false,
  _id: true,
  autoIndex: true,
  timestamps: true,
})
class ExampleClass {
  @Prop({ required: true })
  children: ChildClass;

  @Prop([ChildClass])
  nodes: ChildClass[];

  @Prop()
  array: Array<any>;
}

describe('SchemaFactory', () => {
  it('should populate the schema options', () => {
    const schema = SchemaFactory.createForClass(ExampleClass) as any;

    expect(schema.$timestamps).toBeDefined();
    expect(schema.options).toEqual(
      expect.objectContaining({
        validateBeforeSave: false,
        _id: true,
        autoIndex: true,
        timestamps: true,
      }),
    );

    expect(schema.childSchemas[0].schema).toEqual(
      expect.objectContaining({
        options: expect.objectContaining({
          validateBeforeSave: false,
          _id: true,
          autoIndex: true,
        }),
      }),
    );
  });
});
