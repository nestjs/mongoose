import { Prop, Schema, SchemaFactory } from '../../lib';
import { Method } from '../../lib';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';

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

  @Prop()
  name: string;

  @Method()
  getName(): string {
    return this.name;
  }

  @Method()
  setName(newName: string): void {
    this.name = newName;
  }
}

describe('SchemaFactory', () => {
  const schema = SchemaFactory.createForClass(ExampleClass) as any;
  const ExampleClassModel = mongoose.model(
    ExampleClass.name,
    schema,
  ) as Model<ExampleClass>;

  it('should populate the schema options', () => {
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

  describe('@Method decorator', () => {
    it('schema should contain method getName', () => {
      expect(schema.methods.getName).toBeDefined();
    });

    it('schema should contain method setName', () => {
      expect(schema.methods.setName).toBeDefined();
    });

    it('model instance should contain method getName decorated with @Method() decorator', () => {
      const exampleClassInstance = new ExampleClassModel({ name: 'Cat' });

      expect(exampleClassInstance.getName).toBeDefined();
    });

    it('model instance should contain method setName decorated with @Method() decorator', () => {
      const exampleClassInstance = new ExampleClassModel({ name: 'Cat' });

      expect(exampleClassInstance.setName).toBeDefined();
    });

    it('method getName decorated with @Method() decorator should return the name property', () => {
      const name = 'Cat';
      const exampleClassInstance = new ExampleClassModel({ name });

      expect(exampleClassInstance.getName()).toStrictEqual(name);
    });

    it('method setName decorated with @Method() decorator should change the name property', () => {
      const name = 'Cat';
      const exampleClassInstance = new ExampleClassModel({ name });

      const anotherName = 'Dog';
      exampleClassInstance.setName(anotherName);
      expect(exampleClassInstance.name).toStrictEqual(anotherName);
    });
  });
});
