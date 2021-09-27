import * as mongoose from 'mongoose';
import { DefinitionsFactory, Prop, raw, Schema } from '../../lib';
import { CannotDetermineTypeError } from '../../lib/errors';

@Schema()
class RefClass {
  @Prop()
  title: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => ExampleClass })
  host;
}

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

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: () => RefClass }],
  })
  ref: RefClass[];

  @Prop({ required: true })
  child: ChildClass;

  @Prop({ type: () => ChildClass })
  child2: ChildClass;

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
      ref: {
        type: [
          {
            ref: 'RefClass',
            type: mongoose.Schema.Types.ObjectId,
          },
        ],
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
      child: {
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
      child2: {
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

  it('should generate a valid schema definition (class reference) for cyclic deps', () => {
    const refClassDefinition = DefinitionsFactory.createForClass(RefClass);
    expect(refClassDefinition).toEqual({
      host: {
        ref: 'ExampleClass',
        type: mongoose.Schema.Types.ObjectId,
      },
      title: {
        type: String,
      },
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
      expect((err as Error).message).toEqual(
        'Cannot determine a type for the "AmbiguousField.randomField" field (union/intersection/ambiguous type was used). Make sure your property is decorated with a "@Prop({ type: TYPE_HERE })" decorator.',
      );
    }
  });
});
