import * as mongoose from 'mongoose';
import { DefinitionsFactory, Prop, raw, Schema } from '../../lib';

@Schema()
class ChildClass {
  @Prop()
  id: number;

  @Prop()
  name: string;
}

@Schema()
class ExampleClass {
  @Prop()
  objectId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  buffer: mongoose.Schema.Types.Buffer;

  @Prop()
  decimal: mongoose.Schema.Types.Decimal128;

  @Prop()
  mixed: mongoose.Schema.Types.Mixed;

  @Prop(
    raw({
      expires: 0,
      type: Date,
    }),
  )
  expiresAt: Date;

  @Prop()
  map: Map<any, any>;

  @Prop()
  isEnabled: boolean;

  @Prop()
  number: number;

  @Prop({ required: true })
  children: ChildClass;

  @Prop([ChildClass])
  nodes: ChildClass[];

  @Prop([raw({ custom: 'literal', object: true })])
  customArray: any;

  @Prop(raw({ custom: 'literal', object: true }))
  customObject: any;

  @Prop()
  any: any;

  @Prop()
  array: Array<any>;
}

describe('DefinitionsFactory', () => {
  it('should generate a valid schema definition', () => {
    const definition = DefinitionsFactory.createForClass(ExampleClass);
    expect(definition).toEqual({
      objectId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      name: {
        required: true,
        type: String,
      },
      nodes: [
        {
          id: {
            type: Number,
          },
          name: {
            type: String,
          },
        },
      ],
      buffer: { type: mongoose.Schema.Types.Buffer },
      decimal: { type: mongoose.Schema.Types.Decimal128 },
      children: {
        required: true,
        type: {
          id: {
            type: Number,
          },
          name: {
            type: String,
          },
        },
      },
      any: {},
      array: { type: [] },
      customArray: [{ custom: 'literal', object: true }],
      customObject: { custom: 'literal', object: true },
      expiresAt: {
        expires: 0,
        type: Date,
      },
      isEnabled: {
        type: Boolean,
      },
      map: {
        type: Map,
      },
      mixed: { type: mongoose.Schema.Types.Mixed },
      number: { type: Number },
    });
  });
});
