import { Type } from '@nestjs/common';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import * as mongoose from 'mongoose';
import { PropOptions } from '../decorators';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';

const BUILT_IN_TYPES: Function[] = [Boolean, Number, String, Map, Date];

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
    optionsOrType: mongoose.SchemaTypeOptions<unknown> | Function,
  ): PropOptions | [PropOptions] | Function {
    if (typeof optionsOrType === 'function') {
      if (this.isPrimitive(optionsOrType)) {
        return optionsOrType;
      } else if (this.isMongooseSchemaType(optionsOrType)) {
        return optionsOrType;
      }

      const schemaDefinition = this.createForClass(
        optionsOrType as Type<unknown>,
      );
      const schemaMetadata = TypeMetadataStorage.getSchemaMetadataByTarget(
        optionsOrType as Type<unknown>,
      );
      if (schemaMetadata?.options) {
        /**
         * When options are provided (e.g., `@Schema({ timestamps: true })`)
         * create a new nested schema for a subdocument
         * @ref https://mongoosejs.com/docs/subdocs.html
         **/

        return new mongoose.Schema(schemaDefinition, schemaMetadata.options);
      }
      return schemaDefinition;
    } else if (typeof optionsOrType.type === 'function') {
      optionsOrType.type = this.inspectTypeDefinition(optionsOrType.type);
      return optionsOrType;
    } else if (Array.isArray(optionsOrType)) {
      return optionsOrType.length > 0
        ? [this.inspectTypeDefinition(optionsOrType[0])]
        : (optionsOrType as any);
    }
    return optionsOrType;
  }

  private static isPrimitive(type: Function) {
    return BUILT_IN_TYPES.includes(type);
  }

  private static isMongooseSchemaType(type: Function) {
    if (!type || !type.prototype) {
      return false;
    }
    const prototype = Object.getPrototypeOf(type.prototype);
    return prototype && prototype.constructor === mongoose.SchemaType;
  }
}
