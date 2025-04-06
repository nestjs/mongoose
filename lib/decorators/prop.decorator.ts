import * as mongoose from 'mongoose';
import { CannotDetermineTypeError } from '../errors';
import { RAW_OBJECT_DEFINITION } from '../mongoose.constants';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';

const TYPE_METADATA_KEY = 'design:type';
/**
 * Interface defining property options that can be passed to `@Prop()` decorator.
 */
export type PropOptions<T = any> =
  | Partial<mongoose.SchemaDefinitionProperty<T>>
  | mongoose.SchemaType;

/**
 * @Prop decorator is used to mark a specific class property as a Mongoose property.
 * Only properties decorated with this decorator will be defined in the schema.
 * 
 * @publicApi
 */
export function Prop(options?: PropOptions): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    options = (options || {}) as mongoose.SchemaTypeOptions<unknown>;

    const isRawDefinition = options[RAW_OBJECT_DEFINITION];
    if (!options.type && !Array.isArray(options) && !isRawDefinition) {
      const type = Reflect.getMetadata(TYPE_METADATA_KEY, target, propertyKey);

      if (type === Array) {
        options.type = [];
      } else if (type && type !== Object) {
        options.type = type;
      } else {
        throw new CannotDetermineTypeError(
          target.constructor?.name,
          propertyKey as string,
        );
      }
    }

    TypeMetadataStorage.addPropertyMetadata({
      target: target.constructor,
      propertyKey: propertyKey as string,
      options: options as PropOptions,
    });
  };
}
