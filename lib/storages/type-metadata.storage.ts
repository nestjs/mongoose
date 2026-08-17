import { Type } from '@nestjs/common';
import { PropertyMetadata } from '../metadata/property-metadata.interface.js';
import { SchemaMetadata } from '../metadata/schema-metadata.interface.js';
import { VirtualMetadataInterface } from '../metadata/virtual-metadata.interface.js';
import { isTargetEqual } from '../utils/is-target-equal-util.js';

export class TypeMetadataStorageHost {
  private schemas = new Array<SchemaMetadata>();
  private properties = new Array<PropertyMetadata>();
  private virtuals = new Array<VirtualMetadataInterface>();

  addPropertyMetadata(metadata: PropertyMetadata) {
    this.properties.unshift(metadata);
  }

  addSchemaMetadata(metadata: SchemaMetadata) {
    this.compileClassMetadata(metadata);
    this.schemas.push(metadata);
  }

  addVirtualMetadata(metadata: VirtualMetadataInterface) {
    this.virtuals.push(metadata);
  }

  getSchemaMetadataByTarget(target: Type<unknown>): SchemaMetadata | undefined {
    return this.schemas.find((item) => item.target === target);
  }

  getVirtualsMetadataByTarget<TClass>(targetFilter: Type<TClass>) {
    return this.virtuals.filter(({ target }) => target === targetFilter);
  }

  private compileClassMetadata(metadata: SchemaMetadata) {
    const belongsToClass = isTargetEqual.bind(undefined, metadata);

    if (!metadata.properties) {
      metadata.properties = this.getClassFieldsByPredicate(belongsToClass);
    }
  }

  private getClassFieldsByPredicate(
    belongsToClass: (item: PropertyMetadata) => boolean,
  ) {
    return this.properties.filter(belongsToClass);
  }
}

const globalRef = globalThis as any;
export const TypeMetadataStorage: TypeMetadataStorageHost =
  globalRef.MongoTypeMetadataStorage ||
  (globalRef.MongoTypeMetadataStorage = new TypeMetadataStorageHost());
