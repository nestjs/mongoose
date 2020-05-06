import * as mongoose from 'mongoose';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';

const TYPE_METADATA_KEY = 'design:type';

/**
 * Interface defining property options that can be passed to `@Prop()` decorator.
 */
export type PropOptions =
  | mongoose.SchemaTypeOpts<any>
  | mongoose.Schema
  | mongoose.SchemaType;

/**
 * @Prop() decorator is used to mark a specific class property as a Mongoose property.
 * Only properties decorated with this decorator will be defined in the schema.
 */
export function Prop(options?: PropOptions): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    options = options || {};

    const schemaTypeOpts = options as mongoose.SchemaTypeOpts<unknown>;
    if (!schemaTypeOpts.type) {
      const type = Reflect.getMetadata(
        TYPE_METADATA_KEY,
        target.constructor,
        propertyKey,
      );
      if (type) {
        schemaTypeOpts.type = type;
      }
    }

    TypeMetadataStorage.addPropertyMetadata({
      target: target.constructor,
      propertyKey: propertyKey as string,
      options,
    });
  };
}
