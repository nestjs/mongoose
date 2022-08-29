import { DynamicModule, flatten, Module } from '@nestjs/common';
import { AsyncModelFactory, ModelDefinition } from './interfaces';
import {
  MongooseModuleDynamicConnectionOptions,
  MongooseModuleAsyncOptions,
  MongooseModuleOptions,
  CreateMongooseDynamicProviders,
} from './interfaces/mongoose-options.interface';
import { MongooseCoreModule } from './mongoose-core.module';
import {
  createMongooseAsyncProviders,
  createMongooseProviders,
  createMongooseDynamicProviders,
} from './mongoose.providers';

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

  static forRootDynamicConnection(
    options: MongooseModuleDynamicConnectionOptions,
  ): DynamicModule {
    return {
      module: MongooseModule,
      imports: [MongooseCoreModule.forRootDynamicConnection(options)],
    };
  }

  static forFeature(
    models: ModelDefinition[] = [],
    connectionName?: string,
  ): DynamicModule {
    const providers = createMongooseProviders(connectionName, models);
    return {
      module: MongooseModule,
      providers: providers,
      exports: providers,
    };
  }

  static forFeatureAsync(
    factories: AsyncModelFactory[] = [],
    connectionName?: string,
  ): DynamicModule {
    const providers = createMongooseAsyncProviders(connectionName, factories);
    const imports = factories.map((factory) => factory.imports || []);
    const uniqImports = new Set(flatten(imports));

    return {
      module: MongooseModule,
      imports: [...uniqImports],
      providers: providers,
      exports: providers,
    };
  }

  static forFeatureDynamic({
    models = [],
    factory,
    resolverKey,
  }: CreateMongooseDynamicProviders): DynamicModule {
    const providers = createMongooseDynamicProviders({
      models,
      factory,
      resolverKey,
    });

    return {
      module: MongooseModule,
      providers: providers,
      exports: providers,
    };
  }
}
