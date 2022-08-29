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
import { defer, lastValueFrom } from 'rxjs';
import { getConnectionToken, handleRetry } from './common/mongoose.utils';
import {
  MongooseDynamicConnection,
  MongooseModuleDynamicConnectionOptions,
  MongooseModuleAsyncOptions,
  MongooseModuleFactoryOptions,
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from './interfaces/mongoose-options.interface';
import {
  MONGOOSE_CONNECTION_NAME,
  MONGOOSE_DYNAMIC_CONNECTION,
  MONGOOSE_MODULE_OPTIONS,
} from './mongoose.constants';

@Global()
@Module({})
export class MongooseCoreModule implements OnApplicationShutdown {
  private static dynamicConnections = new Map<string, mongoose.Connection>();

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
        await lastValueFrom(
          defer(async () =>
            mongooseConnectionFactory(
              await mongoose.createConnection(uri, mongooseOptions).asPromise(),
              mongooseConnectionName,
            ),
          ).pipe(handleRetry(retryAttempts, retryDelay)),
        ),
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
        mongooseModuleOptions: MongooseModuleFactoryOptions,
      ): Promise<any> => {
        const {
          retryAttempts,
          retryDelay,
          uri,
          connectionFactory,
          ...mongooseOptions
        } = mongooseModuleOptions;

        const mongooseConnectionFactory =
          connectionFactory || ((connection) => connection);

        return await lastValueFrom(
          defer(async () =>
            mongooseConnectionFactory(
              await mongoose
                .createConnection(uri as string, mongooseOptions)
                .asPromise(),
              mongooseConnectionName,
            ),
          ).pipe(handleRetry(retryAttempts, retryDelay)),
        );
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

  static forRootDynamicConnection({
    resolver,
    options = {},
  }: MongooseModuleDynamicConnectionOptions): DynamicModule {
    const { retryAttempts, retryDelay, connectionFactory, ...mongooseOptions } =
      options;

    const mongooseConnectionNameProvider = {
      provide: MONGOOSE_CONNECTION_NAME,
      useValue: MONGOOSE_DYNAMIC_CONNECTION,
    };

    const mongooseConnectionFactory =
      connectionFactory || ((connection) => connection);

    const connectionProvider: Provider = {
      provide: MONGOOSE_DYNAMIC_CONNECTION,
      useFactory: (): MongooseDynamicConnection => {
        const initNewConnection = (dynamicKey: string) => {
          const resolved = resolver(dynamicKey);

          const uri = typeof resolved === 'string' ? resolved : resolved?.uri;
          const dbName =
            typeof resolved === 'object'
              ? resolved.dbName
              : mongooseOptions.dbName;

          return lastValueFrom<mongoose.Connection>(
            defer(async () =>
              mongooseConnectionFactory(
                await mongoose
                  .createConnection(uri, { ...mongooseOptions, dbName })
                  .asPromise(),
                dynamicKey,
              ),
            ).pipe(handleRetry(retryAttempts, retryDelay)),
          );
        };

        const getConn = async (dynamicKey: string) => {
          const conn = this.dynamicConnections.get(dynamicKey);
          if (conn) return Promise.resolve(conn);

          const newConn = await initNewConnection(dynamicKey);
          this.dynamicConnections.set(dynamicKey, newConn);

          return newConn;
        };

        const closeAll = async (conns: Map<string, mongoose.Connection>) => {
          for (const key of conns.keys()) {
            await conns.get(key)?.close();
          }

          conns.clear();
        };

        return { get: getConn, closeAll };
      },
    };

    return {
      module: MongooseCoreModule,
      providers: [connectionProvider, mongooseConnectionNameProvider],
      exports: [connectionProvider],
    };
  }

  async onApplicationShutdown() {
    const connection = this.moduleRef.get<any>(this.connectionName);

    if (connection && this.connectionName === MONGOOSE_DYNAMIC_CONNECTION) {
      connection.closeAll(MongooseCoreModule.dynamicConnections);
      return;
    }

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
