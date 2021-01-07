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
    return new mongoose.Schema<TDocument>(
      schemaDefinition,
      schemaMetadata && schemaMetadata.options,
    );
  }
}
