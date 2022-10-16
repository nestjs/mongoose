import { MongoosePluginFunction } from '../interfaces';
import { TypeMetadataStorage } from '../storages/type-metadata.storage';

/**
 * @Plugin decorator is used to add plugin to the schema.
 */
export function Plugin<
  PFunc extends MongoosePluginFunction,
  POptions extends Parameters<PFunc>[1] = Parameters<PFunc>[1],
>(pluginFn: PFunc, options?: POptions): ClassDecorator {
  return (target: Function) => {
    TypeMetadataStorage.addPluginMetadata({
      target,
      pluginFn,
      options,
    });
  };
}
