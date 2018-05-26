import { DynamicModule, Global, Module } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { of } from 'rxjs';
import { MongooseModuleOptions } from './interfaces/mongoose-options.interface';
import { DefaultDbConnectionToken } from './mongoose.constants';
import { handleRetry } from './mongoose.utils';

@Global()
@Module({})
export class MongooseCoreModule {
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

    const connectionProvider = {
      provide: connectionName || DefaultDbConnectionToken,
      useFactory: async (): Promise<any> =>
        await of(mongoose.createConnection(uri, mongooseOptions as any))
          .pipe(handleRetry(retryAttempts, retryDelay))
          .toPromise(),
    };
    return {
      module: MongooseCoreModule,
      providers: [connectionProvider],
      exports: [connectionProvider],
    };
  }
}
