import { Type } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { SchemaDefinition, SchemaDefinitionType } from 'mongoose';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';
import { DefinitionsFactory } from './definitions.factory';
import { VirtualsFactory } from './virtuals.factory';

/**
 * @publicApi
 */
export class SchemaFactory {
  static createForClass<TClass = any>(
    target: Type<TClass>,
  ): mongoose.Schema<TClass> {
    const schemaDefinition = DefinitionsFactory.createForClass(target);
    const schemaMetadata =
      TypeMetadataStorage.getSchemaMetadataByTarget(target);
    const schemaOpts = schemaMetadata?.options;

    const schema = new mongoose.Schema<TClass>(
      schemaDefinition as SchemaDefinition<SchemaDefinitionType<TClass>>,
      schemaOpts as mongoose.SchemaOptions<any>,
    );

    VirtualsFactory.inspect(target, schema);

    return schema;
  }
}
