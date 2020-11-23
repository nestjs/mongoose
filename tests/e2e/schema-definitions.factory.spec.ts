import * as mongoose from 'mongoose';
import { DefinitionsFactory, Prop, raw, Schema } from '../../lib';
import { CannotDetermineTypeError } from '../../lib/errors';

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

  @Prop({ type: mongoose.Schema.Types.Mixed })
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
      any: { type: mongoose.Schema.Types.Mixed },
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

  it('should throw an error when type is ambiguous', () => {
    try {
      class AmbiguousField {
        @Prop()
        randomField: object | null;
      }
      DefinitionsFactory.createForClass(AmbiguousField);
    } catch (err) {
      expect(err).toBeInstanceOf(CannotDetermineTypeError);
      expect(err.message).toEqual(
        'Cannot determine a type for the "AmbiguousField.randomField" field (union/intersection/ambiguous type was used). Make sure your property is decorated with a "@Prop({ type: TYPE_HERE })" decorator.',
      );
    }
  });
});
