import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModuleOptions } from './interfaces/mongoose-options.interface';
import { MongooseCoreModule } from './mongoose-core.module';
import { DefaultDbConnectionToken } from './mongoose.constants';
import { createMongooseProviders } from './mongoose.providers';

@Module({})
export class MongooseModule {
  static forRoot(
    uri: string,
    options: MongooseModuleOptions = {},
  ): DynamicModule {
    return {
      module: MongooseModule,
      imports: [MongooseCoreModule.forRoot(uri, options)],
    };
  }

  static forFeature(
    models: { name: string; schema: any; collection?: string }[] = [],
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
