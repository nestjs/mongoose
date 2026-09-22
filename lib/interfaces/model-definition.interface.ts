import { Schema } from 'mongoose';

/**
 * @publicApi
 */
export type DiscriminatorOptions = {
  name: string;
  schema: Schema;
  value?: string;
};


/**
 * @publicApi
 */
export type ModelDefinition = {
  name: string;
  schema: any;
  collection?: string;
  discriminators?: DiscriminatorOptions[];
};
