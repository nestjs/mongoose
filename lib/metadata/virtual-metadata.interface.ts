import { VirtualTypeOptions } from 'mongoose';

export interface VirtualMetadataInterface {
  target: Function;
  name: string;
  options?: VirtualTypeOptions;
  getter?: (...args: any[]) => any;
  setter?: (...args: any[]) => any;
}
