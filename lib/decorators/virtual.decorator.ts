import { VirtualTypeOptions } from 'mongoose';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';

/**
 * Interface defining the options that can be passed to the `@Virtual()` decorator.
 * 
 * @publicApi
 */
export interface VirtualOptions {
  /**
   * The options to pass to the virtual type.
   */
  options?: VirtualTypeOptions;
  /**
   * The sub path to use for the virtual.
   * Defaults to the property key.
   */
  subPath?: string;
  /**
   * The getter function to use for the virtual.
   */
  get?: (...args: any[]) => any;
  /**
   * The setter function to use for the virtual.
   */
  set?: (...args: any[]) => any;
}

/**
 * The Virtual decorator marks a class property as a Mongoose virtual.
 * 
 * @publicApi
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
