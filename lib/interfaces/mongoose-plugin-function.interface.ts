import { Schema } from 'mongoose';

export type MongoosePluginFunction = (schema: Schema, opts?: any) => void;
