import * as mongoose from 'mongoose';
import { Module, DynamicModule, Global } from '@nestjs/common';

import { createMongooseProviders } from './mongoose.providers';
import { MongooseCoreModule } from './mongoose-core.module';

@Module({})
export class MongooseModule {
  static forRoot(
    uri: string,
    options: mongoose.ConnectionOptions = {},
  ): DynamicModule {
    return {
      module: MongooseModule,
      modules: [MongooseCoreModule.forRoot(uri, options)],
    };
  }

  static forFeature(
    models: { name: string; schema: mongoose.Schema }[] = [],
  ): DynamicModule {
    const providers = createMongooseProviders(models);
    return {
      module: MongooseModule,
      components: providers,
      exports: providers,
    };
  }
}
