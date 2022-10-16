import { MongoosePluginFunction } from '../interfaces';

export interface PluginMetadata {
  target: Function;
  pluginFn: MongoosePluginFunction;
  options?: any;
}
