import { Type } from '@nestjs/common';
import { PropertyMetadata } from '../metadata/property-metadata.interface';
import { SchemaMetadata } from '../metadata/schema-metadata.interface';
import { isTargetEqual } from '../utils/is-target-equal-util';
import { MethodMetadata } from '../metadata/method-metadata.interface';

export class TypeMetadataStorageHost {
  private schemas = new Array<SchemaMetadata>();
  private properties = new Array<PropertyMetadata>();
  private methods = new Array<MethodMetadata>();

  addMethodMetadata(metadata: MethodMetadata) {
    this.methods.unshift(metadata);
  }

  addPropertyMetadata(metadata: PropertyMetadata) {
    this.properties.unshift(metadata);
  }

  addSchemaMetadata(metadata: SchemaMetadata) {
    this.compileClassMetadata(metadata);
    this.schemas.push(metadata);
  }

  getSchemaMetadataByTarget(target: Type<unknown>): SchemaMetadata | undefined {
    return this.schemas.find((item) => item.target === target);
  }

  private compileClassMetadata(metadata: SchemaMetadata) {
    const belongsToClass = isTargetEqual.bind(undefined, metadata);

    if (!metadata.properties) {
      metadata.properties = this.getClassFieldsByPredicate(belongsToClass);
    }

    if (!metadata.methods) {
      metadata.methods = this.getClassMethodsByPredicate(belongsToClass);
    }
  }

  private getClassFieldsByPredicate(
    belongsToClass: (item: PropertyMetadata) => boolean,
  ) {
    return this.properties.filter(belongsToClass);
  }

  private getClassMethodsByPredicate(
    belongsToClass: (item: MethodMetadata) => boolean,
  ) {
    return this.methods.filter(belongsToClass);
  }
}

const globalRef = global as any;
export const TypeMetadataStorage: TypeMetadataStorageHost =
  globalRef.MongoTypeMetadataStorage ||
  (globalRef.MongoTypeMetadataStorage = new TypeMetadataStorageHost());
