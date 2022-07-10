import mongoose from 'mongoose';
import { SchemaMetadata } from '../metadata/schema-metadata.interface';

export class SchemaMethodsFactory {
  static createForClass<TClass = any>(
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
