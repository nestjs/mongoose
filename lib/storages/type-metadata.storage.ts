import { Type } from '@nestjs/common';
import { PropertyMetadata } from '../metadata/property-metadata.interface';
import { SchemaMetadata } from '../metadata/schema-metadata.interface';
import { isTargetEqual } from '../utils/is-target-equal-util';

export class TypeMetadataStorageHost {
  private schemas = new Array<SchemaMetadata>();
  private properties = new Array<PropertyMetadata>();

  addPropertyMetadata(metadata: PropertyMetadata) {
    this.properties.push(metadata);
  }

  getPropertiesMetadata(): PropertyMetadata[] {
    return this.properties;
  }

  addSchemaMetadata(metadata: SchemaMetadata) {
    this.schemas.push(metadata);
  }

  getSchemasMetadata(): SchemaMetadata[] {
    return this.schemas;
  }

  getSchemaMetadataByTarget(target: Type<unknown>): SchemaMetadata | undefined {
    return this.schemas.find(item => item.target === target);
  }

  compile() {
    this.compileClassMetadata(this.schemas);
  }

  private compileClassMetadata(metadata: SchemaMetadata[]) {
    metadata.forEach(item => {
      const belongsToClass = isTargetEqual.bind(undefined, item);

      if (!item.properties) {
        item.properties = this.getClassFieldsByPredicate(belongsToClass);
      }
    });
  }

  clear() {
    Object.assign(this, new TypeMetadataStorageHost());
  }

  private getClassFieldsByPredicate(
    belongsToClass: (item: PropertyMetadata) => boolean,
  ) {
    return this.properties.filter(belongsToClass);
  }
}

const globalRef = global as any;
export const TypeMetadataStorage: TypeMetadataStorageHost =
  globalRef.MongoTypeMetadataStorage ||
  (globalRef.MongoTypeMetadataStorage = new TypeMetadataStorageHost());
