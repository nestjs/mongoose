import { Type } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { TypeMetadataStorage } from '../storages/type-metadata.storage.js';

const isUndefined = (value: unknown): value is undefined => value === undefined;

/**
 * @publicApi
 */
export class VirtualsFactory {
  static inspect<TClass = any>(
    target: Type<TClass>,
    schema: mongoose.Schema<TClass>,
  ): void {
    let parent = target;

    while (!isUndefined(parent.prototype)) {
      if (parent === Function.prototype) {
        break;
      }
      const virtuals = TypeMetadataStorage.getVirtualsMetadataByTarget(parent);

      virtuals.forEach(({ options, name, getter, setter }) => {
        const virtual = schema.virtual(name, options);

        if (getter) {
          virtual.get(getter);
        }

        if (setter) {
          virtual.set(setter);
        }
      });

      parent = Object.getPrototypeOf(parent);
    }
  }
}
