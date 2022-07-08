import * as mongoose from 'mongoose';
import { PropertyMetadata } from './property-metadata.interface';
import { MethodMetadata } from './method-metadata.interface';

export interface SchemaMetadata {
  target: Function;
  options?: mongoose.SchemaOptions;
  properties?: PropertyMetadata[];
  methods?: MethodMetadata[];
}
