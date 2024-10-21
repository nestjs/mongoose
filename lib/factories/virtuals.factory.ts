import { Type } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';

export class VirtualsFactory {
  static inspect<TClass = any>(
    target: Type<TClass>,
    schema: mongoose.Schema<TClass>,
  ): void {
    const virtuals = TypeMetadataStorage.getVirtualsMetadataByTarget(target);

    virtuals.forEach(({ options, name, getter, setter }) => {
      const virtual = schema.virtual(name, options);

      if (getter) {
        virtual.get(getter);
      }

      if (setter) {
        virtual.set(setter);
      }
    });
  }
}
