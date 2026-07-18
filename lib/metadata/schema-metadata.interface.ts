import * as mongoose from 'mongoose';
import { PropertyMetadata } from './property-metadata.interface.js';

export interface SchemaMetadata {
  target: Function;
  options?: mongoose.SchemaOptions;
  properties?: PropertyMetadata[];
}
