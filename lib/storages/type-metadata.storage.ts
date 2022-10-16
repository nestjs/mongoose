import { Type } from '@nestjs/common';
import { PropertyMetadata } from '../metadata/property-metadata.interface';
import { SchemaMetadata } from '../metadata/schema-metadata.interface';
import { isTargetEqual } from '../utils/is-target-equal-util';
import { PluginMetadata } from './../metadata/plugin-metadata.interface';

export class TypeMetadataStorageHost {
  private schemas = new Array<SchemaMetadata>();
  private properties = new Array<PropertyMetadata>();
  private plugins = new Array<PluginMetadata>();

  addPropertyMetadata(metadata: PropertyMetadata) {
    this.properties.unshift(metadata);
  }

  addPluginMetadata(metadata: PluginMetadata) {
    this.plugins.unshift(metadata);
  }

  addSchemaMetadata(metadata: SchemaMetadata) {
    this.compileClassMetadata(metadata);
    this.schemas.push(metadata);
  }

  getPluginMetadataByTarget(target: Type<unknown>): Array<PluginMetadata> {
    return this.plugins.filter((plugin) => plugin.target === target);
  }

  getSchemaMetadataByTarget(target: Type<unknown>): SchemaMetadata | undefined {
    return this.schemas.find((item) => item.target === target);
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

const globalRef = global as any;
export const TypeMetadataStorage: TypeMetadataStorageHost =
  globalRef.MongoTypeMetadataStorage ||
  (globalRef.MongoTypeMetadataStorage = new TypeMetadataStorageHost());
