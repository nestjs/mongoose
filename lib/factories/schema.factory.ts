import { Type } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';
import { DefinitionsFactory } from './definitions.factory';

export class SchemaFactory {
  static createForClass(target: Type<unknown>) {
    const schemaDefinition = DefinitionsFactory.createForClass(target);
    const schemaMetadata = TypeMetadataStorage.getSchemaMetadataByTarget(
      target,
    );
    return new mongoose.Schema(
      schemaDefinition,
      schemaMetadata && schemaMetadata.options,
    );
  }
}
