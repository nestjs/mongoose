import { DynamicModule, Global, Inject, Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as mongoose from 'mongoose';
import { of } from 'rxjs';
import { MongooseModuleOptions } from './interfaces/mongoose-options.interface';
import { DefaultDbConnectionToken } from './mongoose.constants';
import { handleRetry } from './mongoose.utils';

@Global()
@Module({})
export class MongooseCoreModule {
  constructor(
    @Inject('MONGOOSE_CONNECTION_NAME') private readonly connectionName: string,
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
      ...mongooseOptions
    } = options;

    const mongooseConnectionNameProvider = {
      provide: 'MONGOOSE_CONNECTION_NAME',
      useValue: connectionName || DefaultDbConnectionToken,
    };
    const connectionProvider = {
      provide: connectionName || DefaultDbConnectionToken,
      useFactory: async (): Promise<any> =>
        await of(mongoose.createConnection(uri, mongooseOptions as any))
          .pipe(handleRetry(retryAttempts, retryDelay))
          .toPromise(),
    };
    return {
      module: MongooseCoreModule,
      providers: [connectionProvider, mongooseConnectionNameProvider],
      exports: [connectionProvider],
    };
  }

  async onModuleDestroy() {
    const connection = this.moduleRef.get<any>(this.connectionName);
    connection && (await connection.close());
  }
}
