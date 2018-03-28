/// <reference types="mongoose" />
import * as mongoose from "mongoose";
export declare function createMongooseProviders(
  models?: {
    name: string;
    schema: mongoose.Schema;
  }[]
): {
  provide: string;
  useFactory: (connection: any) => any;
  inject: string[];
}[];
