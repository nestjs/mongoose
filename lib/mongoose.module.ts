import { DynamicModule, Module } from '@nestjs/common';
import {
  MongooseModuleAsyncOptions,
  MongooseModuleOptions,
} from './interfaces/mongoose-options.interface';
import { MongooseCoreModule } from './mongoose-core.module';
import { DEFAULT_DB_CONNECTION } from './mongoose.constants';
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

  static forRootAsync(options: MongooseModuleAsyncOptions): DynamicModule {
    return {
      module: MongooseModule,
      imports: [MongooseCoreModule.forRootAsync(options)],
    };
  }

  static forFeature(
    models: { name: string; schema: any; collection?: string }[] = [],
    connectionName: string = DEFAULT_DB_CONNECTION,
  ): DynamicModule {
    const providers = createMongooseProviders(connectionName, models);
    return {
      module: MongooseModule,
      providers: providers,
      exports: providers,
    };
  }
}
