import { Type } from '@nestjs/common';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import * as mongoose from 'mongoose';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';

export class SchemaFactory {
  static createForClass(target: Type<unknown>) {
    if (!target) {
      throw new Error('');
    }
    const schemaMetadata = TypeMetadataStorage.getSchemaMetadataByTarget(
      target,
    );
    if (!schemaMetadata) {
      throw new Error('no');
    }

    let schemaDefinition: mongoose.SchemaDefinition = {};
    let parent: Function = target;

    while (!isUndefined(parent.prototype)) {
      parent = Object.getPrototypeOf(parent);
      if (parent === Function.prototype) {
        break;
      }
      schemaMetadata.properties?.forEach(item => {
        schemaDefinition = {
          [item.propertyKey]: item.options,
          ...schemaDefinition,
        };
      });
    }

    return new mongoose.Schema(schemaDefinition, schemaMetadata.options);
  }
}
