import { TypeMetadataStorage } from '../storages/type-metadata.storage';

/**
 * @Method decorator is used to mark a specific class method as a Mongoose schema method.
 * Only methods decorated with this decorator will be defined in the schema.
 */
export function Method(): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    TypeMetadataStorage.addMethodMetadata({
      target: target.constructor,
      propertyKey: propertyKey as string,
      descriptor,
    });
  };
}
