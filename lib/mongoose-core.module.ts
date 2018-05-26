import { DynamicModule, Global, Module } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { from } from 'rxjs';
import { MongooseModuleOptions } from './interfaces/mongoose-options.interface';
import { handleRetry } from './mongoose.utils';

@Global()
@Module({})
export class MongooseCoreModule {
  static forRoot(
    uri: string,
    options: MongooseModuleOptions = {},
  ): DynamicModule {
    const { retryAttempts, retryDelay, ...mongooseOptions } = options;

    const connectionProvider = {
      provide: 'DbConnectionToken',
      useFactory: async (): Promise<any> =>
        await from(mongoose.connect(uri, mongooseOptions as any))
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
