import { Schema } from 'mongoose';

export type DiscriminatorOptions = {
  name: string;
  schema: Schema;
};

export type ModelDefinition = {
  name: string;
  schema: any;
  collection?: string;
  discriminators?: DiscriminatorOptions[];
};
