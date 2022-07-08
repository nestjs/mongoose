import mongoose from 'mongoose';
import { Type } from '@nestjs/common';
import { SchemaMetadata } from '../metadata/schema-metadata.interface';

export class SchemaMethodsFactory {
  static createForClass<TClass = any>(
    target: Type<TClass>,
    schema: mongoose.Schema<TClass>,
    schemaMetadata?: SchemaMetadata,
  ): void {
    if (schemaMetadata?.methods) {
      schemaMetadata.methods.forEach((method) => {
        schema.methods[method.propertyKey] = method.descriptor.value;
      });
    }
  }
}
