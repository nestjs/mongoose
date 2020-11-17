/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as mongoose from 'mongoose';
import { defer } from 'rxjs';
import { getConnectionToken, handleRetry } from './common/mongoose.utils';
import {
  MongooseModuleAsyncOptions,
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from './interfaces/mongoose-options.interface';
import {
  MONGOOSE_CONNECTION_NAME,
  MONGOOSE_MODULE_OPTIONS,
} from './mongoose.constants';

@Global()
@Module({})
export class MongooseCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(MONGOOSE_CONNECTION_NAME) private readonly connectionName: string,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRoot(
    uri: string,
    options: MongooseModuleOptions = {},
  ): DynamicModule {
    const {
      retryAttempts,
      retryDelay,
      connectionName,
      connectionFactory,
      ...mongooseOptions
    } = options;

    const mongooseConnectionFactory =
      connectionFactory || ((connection) => connection);
    const mongooseConnectionName = getConnectionToken(connectionName);

    const mongooseConnectionNameProvider = {
      provide: MONGOOSE_CONNECTION_NAME,
      useValue: mongooseConnectionName,
    };
    const connectionProvider = {
      provide: mongooseConnectionName,
      useFactory: async (): Promise<any> =>
        await defer(async () =>
          mongooseConnectionFactory(
            mongoose.createConnection(uri, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
              ...mongooseOptions,
            }),
            mongooseConnectionName,
          ),
        )
          .pipe(handleRetry(retryAttempts, retryDelay))
          .toPromise(),
    };
    return {
      module: MongooseCoreModule,
      providers: [connectionProvider, mongooseConnectionNameProvider],
      exports: [connectionProvider],
    };
  }

  static forRootAsync(options: MongooseModuleAsyncOptions): DynamicModule {
    const mongooseConnectionName = getConnectionToken(options.connectionName);

    const mongooseConnectionNameProvider = {
      provide: MONGOOSE_CONNECTION_NAME,
      useValue: mongooseConnectionName,
    };

    const connectionProvider = {
      provide: mongooseConnectionName,
      useFactory: async (
        mongooseModuleOptions: MongooseModuleOptions,
      ): Promise<any> => {
        const {
          retryAttempts,
          retryDelay,
          connectionName,
          uri,
          connectionFactory,
          ...mongooseOptions
        } = mongooseModuleOptions;

        const mongooseConnectionFactory =
          connectionFactory || ((connection) => connection);

        return await defer(async () =>
          mongooseConnectionFactory(
            mongoose.createConnection(mongooseModuleOptions.uri as string, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
              ...mongooseOptions,
            }),
            mongooseConnectionName,
          ),
        )
          .pipe(
            handleRetry(
              mongooseModuleOptions.retryAttempts,
              mongooseModuleOptions.retryDelay,
            ),
          )
          .toPromise();
      },
      inject: [MONGOOSE_MODULE_OPTIONS],
    };
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: MongooseCoreModule,
      imports: options.imports,
      providers: [
        ...asyncProviders,
        connectionProvider,
        mongooseConnectionNameProvider,
      ],
      exports: [connectionProvider],
    };
  }

  async onApplicationShutdown() {
    const connection = this.moduleRef.get<any>(this.connectionName);
    connection && (await connection.close());
  }

  private static createAsyncProviders(
    options: MongooseModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<MongooseOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: MongooseModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: MONGOOSE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<MongooseOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass || options.useExisting) as Type<MongooseOptionsFactory>,
    ];
    return {
      provide: MONGOOSE_MODULE_OPTIONS,
      useFactory: async (optionsFactory: MongooseOptionsFactory) =>
        await optionsFactory.createMongooseOptions(),
      inject,
    };
  }
}
