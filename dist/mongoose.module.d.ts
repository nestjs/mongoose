import { DynamicModule } from "@nestjs/common";
export declare class MongooseModule {
  static forRoot(uri: string, options?: any): DynamicModule;
  static forFeature(
    models?: {
      name: string;
      schema: any;
    }[]
  ): DynamicModule;
}
