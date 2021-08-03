import { Type } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';
import { DefinitionsFactory } from './definitions.factory';

export class SchemaFactory {
  static createForClass<
    TClass extends any = any,
    TDocument extends mongoose.Document = TClass extends mongoose.Document
      ? TClass
      : mongoose.Document<TClass>
  >(target: Type<TClass>): mongoose.Schema<TDocument> {
    const schemaDefinition = DefinitionsFactory.createForClass(target);
    const schemaMetadata = TypeMetadataStorage.getSchemaMetadataByTarget(
      target,
    );
    const schema = new mongoose.Schema<TDocument>(
      schemaDefinition,
      schemaMetadata && schemaMetadata.options,
    );
    
    // iterares over the methods of the target class
    // and maps the functions to the schema methods
    // reference https://mongoosejs.com/docs/guide.html#methods
    for (const propName of Object.getOwnPropertyNames(target.prototype)) {
      const prop = target.prototype[propName];
      // maps only the functions and ignores the constructor
      if (typeof prop == 'function' && propName != 'constructor') {
        schema.methods[propName] = prop;
      }
    }

    return schema;
  }
}

