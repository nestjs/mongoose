import { Type } from '@nestjs/common';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import * as mongoose from 'mongoose';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';

export class DefinitionsFactory {
  static createForClass(target: Type<unknown>): mongoose.SchemaDefinition {
    if (!target) {
      throw new Error(
        `Target class "${target}" passed in to the "DefinitionsFactory#createForClass()" method is "undefined".`,
      );
    }
    let schemaDefinition: mongoose.SchemaDefinition = {};
    let parent: Function = target;

    while (!isUndefined(parent.prototype)) {
      if (parent === Function.prototype) {
        break;
      }
      const schemaMetadata = TypeMetadataStorage.getSchemaMetadataByTarget(
        parent as Type<unknown>,
      );
      if (!schemaMetadata) {
        parent = Object.getPrototypeOf(parent);
        continue;
      }
      schemaMetadata.properties?.forEach(item => {
        schemaDefinition = {
          [item.propertyKey]: item.options,
          ...schemaDefinition,
        };
      });
      parent = Object.getPrototypeOf(parent);
    }

    return schemaDefinition;
  }
}
