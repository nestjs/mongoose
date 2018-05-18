import { Module, DynamicModule, Global } from '@nestjs/common';

import { DefaultDbConnectionToken } from './mongoose.constants';
import { createMongooseProviders } from './mongoose.providers';
import { MongooseCoreModule } from './mongoose-core.module';

@Module({})
export class MongooseModule {
  static forRoot(uri: string, options: any = {}, connectionName: string = DefaultDbConnectionToken): DynamicModule {
    return {
      module: MongooseModule,
      imports: [MongooseCoreModule.forRoot(uri, options, connectionName)],
    };
  }

  static forFeature(
    models: { name: string; schema: any }[] = [],
    connectionName: string = DefaultDbConnectionToken,
  ): DynamicModule {
    const providers = createMongooseProviders(connectionName, models);
    return {
      module: MongooseModule,
      providers: providers,
      exports: providers,
    };
  }
}
