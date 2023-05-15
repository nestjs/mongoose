import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Ref, Schema, SchemaFactory } from '../../../lib';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  // single ref
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  master?: Ref<User>;

  // array of ref
  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: () => User }],
  })
  subs: Ref<User>[];

  // mongoose.Types.Array of ref
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: () => User }] })
  susp: mongoose.Types.Array<Ref<User>>;
}

export const UserSchema = SchemaFactory.createForClass(User);
