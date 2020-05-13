import * as mongoose from 'mongoose';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';

/**
 * Interface defining schema options that can be passed to `@Schema()` decorator.
 */
export type SchemaOptions = mongoose.SchemaOptions;

/**
 * @Schema decorator is used to mark a class as a Mongoose schema.
 * Only properties decorated with this decorator will be defined in the schema.
 */
export function Schema(options?: SchemaOptions): ClassDecorator {
  return (target: Function) => {
    TypeMetadataStorage.addSchemaMetadata({
      target,
      options,
    });
  };
}
