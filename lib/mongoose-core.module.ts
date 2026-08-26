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
import { ConnectOptions, Connection } from 'mongoose';
import { defer, lastValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  getConnectionToken,
  getModuleOptionsToken,
  handleRetry,
} from './common/mongoose.utils.js';
import {
  MongooseModuleAsyncOptions,
  MongooseModuleFactoryOptions,
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from './interfaces/mongoose-options.interface.js';
import { MONGOOSE_CONNECTION_NAME } from './mongoose.constants.js';

@Global()
@Module({})
export class MongooseCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(MONGOOSE_CONNECTION_NAME) private readonly connectionName: string,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRoot(
    uri: string,
    options: MongooseModuleOptions = {} as MongooseModuleOptions,
  ): DynamicModule {
    const {
      retryAttempts,
      retryDelay,
      connectionName,
      connectionFactory,
      connectionErrorFactory,
      lazyConnection,
      onConnectionCreate,
      verboseRetryLog,
      waitForModelInit: _waitForModelInit,
      ...mongooseOptions
    } = options;

    const mongooseConnectionFactory =
      connectionFactory || ((connection) => connection);

    const mongooseConnectionError =
      connectionErrorFactory || ((error) => error);

    const mongooseConnectionName = getConnectionToken(connectionName);

    const mongooseConnectionNameProvider = {
      provide: MONGOOSE_CONNECTION_NAME,
      useValue: mongooseConnectionName,
    };

    const moduleOptionsProvider = {
      provide: getModuleOptionsToken(connectionName),
      useValue: options,
    };

    const connectionProvider = {
      provide: mongooseConnectionName,
      useFactory: async (): Promise<any> =>
        await lastValueFrom(
          defer(async () =>
            mongooseConnectionFactory(
              await this.createMongooseConnection(uri, mongooseOptions, {
                lazyConnection,
                onConnectionCreate,
              }),
              mongooseConnectionName,
            ),
          ).pipe(
            handleRetry(retryAttempts, retryDelay, verboseRetryLog),
            catchError((error) => {
              throw mongooseConnectionError(error);
            }),
          ),
        ),
    };
    return {
      module: MongooseCoreModule,
      providers: [
        connectionProvider,
        mongooseConnectionNameProvider,
        moduleOptionsProvider,
      ],
      exports: [connectionProvider, moduleOptionsProvider],
    };
  }

  static forRootAsync(options: MongooseModuleAsyncOptions): DynamicModule {
    const mongooseConnectionName = getConnectionToken(options.connectionName);
    const moduleOptionsToken = getModuleOptionsToken(options.connectionName);

    const mongooseConnectionNameProvider = {
      provide: MONGOOSE_CONNECTION_NAME,
      useValue: mongooseConnectionName,
    };

    const connectionProvider = {
      provide: mongooseConnectionName,
      useFactory: async (
        mongooseModuleOptions: MongooseModuleFactoryOptions,
      ): Promise<any> => {
        const {
          retryAttempts,
          retryDelay,
          uri,
          connectionFactory,
          connectionErrorFactory,
          lazyConnection,
          onConnectionCreate,
          verboseRetryLog,
          waitForModelInit: _waitForModelInit,
          ...mongooseOptions
        } = mongooseModuleOptions;

        const mongooseConnectionFactory =
          connectionFactory || ((connection) => connection);

        const mongooseConnectionError =
          connectionErrorFactory || ((error) => error);

        return await lastValueFrom(
          defer(async () =>
            mongooseConnectionFactory(
              await this.createMongooseConnection(
                uri as string,
                mongooseOptions,
                { lazyConnection, onConnectionCreate },
              ),
              mongooseConnectionName,
            ),
          ).pipe(
            handleRetry(retryAttempts, retryDelay, verboseRetryLog),
            catchError((error) => {
              throw mongooseConnectionError(error);
            }),
          ),
        );
      },
      inject: [moduleOptionsToken],
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
      exports: [connectionProvider, moduleOptionsToken],
    };
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
    const moduleOptionsToken = getModuleOptionsToken(options.connectionName);
    if (options.useFactory) {
      return {
        provide: moduleOptionsToken,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<MongooseOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass || options.useExisting) as Type<MongooseOptionsFactory>,
    ];
    return {
      provide: moduleOptionsToken,
      useFactory: async (optionsFactory: MongooseOptionsFactory) =>
        await optionsFactory.createMongooseOptions(),
      inject,
    };
  }

  private static async createMongooseConnection(
    uri: string,
    mongooseOptions: ConnectOptions,
    factoryOptions: {
      lazyConnection?: boolean;
      onConnectionCreate?: MongooseModuleOptions['onConnectionCreate'];
    },
  ): Promise<Connection> {
    const connection = mongoose.createConnection(uri, mongooseOptions);

    if (factoryOptions?.lazyConnection) {
      return connection;
    }

    factoryOptions?.onConnectionCreate?.(connection);

    return connection.asPromise();
  }

  async onApplicationShutdown() {
    const connection = this.moduleRef.get<any>(this.connectionName);
    if (connection) {
      await connection.close();
    }
  }
}
