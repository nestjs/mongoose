import { Prop, Schema, SchemaFactory, Virtual } from '../../lib';

@Schema({ validateBeforeSave: false, _id: true, autoIndex: true })
class ChildClass {
  @Prop()
  id: number;

  @Prop()
  name: string;
}

const getterFunctionMock = jest.fn();
const setterFunctionMock = jest.fn();

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

  @Virtual({
    options: {
      localField: 'array',
      ref: 'ChildClass',
      foreignField: 'id',
    },
  })
  virtualPropsWithOptions: Array<ChildClass>;

  @Virtual({
    get: getterFunctionMock,
    set: setterFunctionMock,
  })
  virtualPropsWithGetterSetterFunctions: Array<ChildClass>;
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

  it('should add virtuals with corresponding options', () => {
    const {
      virtuals: { virtualPropsWithOptions },
    } = SchemaFactory.createForClass(ExampleClass) as any;

    expect(virtualPropsWithOptions).toEqual(
      expect.objectContaining({
        path: 'virtualPropsWithOptions',
        setters: [expect.any(Function)],
        getters: [],
        options: expect.objectContaining({
          localField: 'array',
          ref: 'ChildClass',
          foreignField: 'id',
        }),
      }),
    );
  });

  it('should add virtuals with corresponding getter and setter functions', () => {
    const {
      virtuals: { virtualPropsWithGetterSetterFunctions },
    } = SchemaFactory.createForClass(ExampleClass) as any;

    expect(virtualPropsWithGetterSetterFunctions).toEqual(
      expect.objectContaining({
        path: 'virtualPropsWithGetterSetterFunctions',
        setters: [setterFunctionMock],
        getters: [getterFunctionMock],
        options: {},
      }),
    );
  });

  it('should inherit virtuals from parent classes', () => {
    @Schema()
    class ChildClass extends ExampleClass {}
    const { virtuals } = SchemaFactory.createForClass(ChildClass) as any;

    expect(virtuals.virtualPropsWithOptions).toBeDefined();
    expect(virtuals.virtualPropsWithGetterSetterFunctions).toBeDefined();
  });
});
