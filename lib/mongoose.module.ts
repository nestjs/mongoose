
import * as mongoose from 'mongoose';
import { Module, DynamicModule, Global } from '@nestjs/common';

import { createMongooseProviders } from './mongoose.providers';

@Global()
@Module({})
export class MongooseModule {
  static forRoot(
    uri: string,
    models: { name: string; schema: mongoose.Schema }[] = [],
    options: mongoose.ConnectionOptions = { useMongoClient: true },
  ): DynamicModule {
    const providers = createMongooseProviders(uri, options, models);
    return {
      module: MongooseModule,
      components: providers,
      exports: providers,
    };
  }
}
