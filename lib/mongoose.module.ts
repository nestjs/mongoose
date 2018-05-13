import { Module, DynamicModule, Global } from '@nestjs/common';

import { createMongooseProviders } from './mongoose.providers';
import { MongooseCoreModule } from './mongoose-core.module';

@Module({})
export class MongooseModule {
  static forRoot(uri: string, options: any = {}): DynamicModule {
    return {
      module: MongooseModule,
      imports: [MongooseCoreModule.forRoot(uri, options)],
    };
  }

  static forFeature(
    models: { name: string; schema: any }[] = [],
  ): DynamicModule {
    const providers = createMongooseProviders(models);
    return {
      module: MongooseModule,
      providers: providers,
      exports: providers,
    };
  }
}
