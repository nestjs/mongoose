import { Type } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';
import { DefinitionsFactory } from './definitions.factory';

export class SchemaFactory {
  static createForClass<T extends Type<unknown> = any>(
    target: T,
  ): mongoose.Schema<mongoose.Document<InstanceType<T>>> {
    const schemaDefinition = DefinitionsFactory.createForClass(target);
    const schemaMetadata = TypeMetadataStorage.getSchemaMetadataByTarget(
      target,
    );
    return new mongoose.Schema<mongoose.Document<InstanceType<T>>>(
      schemaDefinition,
      schemaMetadata && schemaMetadata.options,
    );
  }
}
