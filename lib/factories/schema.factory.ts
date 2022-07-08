import { Type } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { SchemaDefinition, SchemaDefinitionType } from 'mongoose';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';
import { DefinitionsFactory } from './definitions.factory';
import { SchemaMethodsFactory } from './schema-methods.factory';

export class SchemaFactory {
  // TODO: remove unused, deprecated type argument
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static createForClass<TClass = any, _TDeprecatedTypeArgument = any>(
    target: Type<TClass>,
  ): mongoose.Schema<TClass> {
    const schemaDefinition = DefinitionsFactory.createForClass(target);
    const schemaMetadata =
      TypeMetadataStorage.getSchemaMetadataByTarget(target);
    const schema = new mongoose.Schema<TClass>(
      schemaDefinition as SchemaDefinition<SchemaDefinitionType<TClass>>,
      schemaMetadata && schemaMetadata.options,
    );

    SchemaMethodsFactory.createForClass(target, schema, schemaMetadata);

    return schema;
  }
}
