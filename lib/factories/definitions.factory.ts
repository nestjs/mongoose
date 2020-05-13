import { Type } from '@nestjs/common';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import * as mongoose from 'mongoose';
import { PropOptions } from '../decorators';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';

const PRIMITIVE_TYPES: Function[] = [Boolean, Number, String];

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
      schemaMetadata.properties?.forEach((item) => {
        const options = this.inspectTypeDefinition(item.options as any);
        schemaDefinition = {
          [item.propertyKey]: options as any,
          ...schemaDefinition,
        };
      });
      parent = Object.getPrototypeOf(parent);
    }

    return schemaDefinition;
  }

  private static inspectTypeDefinition(
    options: mongoose.SchemaTypeOpts<unknown> | Function,
  ): PropOptions {
    if (typeof options === 'function') {
      if (this.isPrimitive(options)) {
        return options;
      } else if (this.isMongooseSchemaType(options)) {
        return options;
      }
      return this.createForClass(options as Type<unknown>);
    } else if (typeof options.type === 'function') {
      options.type = this.inspectTypeDefinition(options.type);
      return options;
    } else if (Array.isArray(options)) {
      return options.length > 0
        ? [this.inspectTypeDefinition(options[0])]
        : options;
    }
    return options;
  }

  private static isPrimitive(type: Function) {
    return PRIMITIVE_TYPES.includes(type);
  }

  private static isMongooseSchemaType(type: Function) {
    if (!type || !type.prototype) {
      return false;
    }
    const prototype = Object.getPrototypeOf(type.prototype);
    return prototype && prototype.constructor === mongoose.SchemaType;
  }
}
