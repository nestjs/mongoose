import { VirtualTypeOptions } from 'mongoose';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';

/**
 * Interface defining property options that can be passed to `@Virtual()` decorator.
 */
export interface VirtualOptions {
  options?: VirtualTypeOptions;
  subPath?: string;
  get?: (...args: any[]) => any;
  set?: (...args: any[]) => any;
}

/**
 * @Virtual decorator is used to mark a specific class property as a Mongoose virtual.
 */
export function Virtual(options?: VirtualOptions): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    TypeMetadataStorage.addVirtualMetadata({
      target: target.constructor,
      options: options?.options,
      name:
        propertyKey.toString() +
        (options?.subPath ? `.${options.subPath}` : ''),
      setter: options?.set,
      getter: options?.get,
    });
  };
}
