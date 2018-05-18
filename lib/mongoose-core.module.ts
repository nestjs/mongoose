import * as mongoose from 'mongoose';
import { Module, DynamicModule, Global } from '@nestjs/common';
import { from } from 'rxjs';
import { DefaultDbConnectionToken } from './mongoose.constants';
import { handleRetry } from './mongoose.utils';

@Global()
@Module({})
export class MongooseCoreModule {
  static forRoot(uri: string, options: any = {}, connectionName: string = DefaultDbConnectionToken): DynamicModule {
    const connectionProvider = {
      provide: connectionName,
      useFactory: async (): Promise<any> =>
        await from(mongoose.createConnection(uri, options))
          .pipe(handleRetry)
          .toPromise(),
    };
    return {
      module: MongooseCoreModule,
      providers: [connectionProvider],
      exports: [connectionProvider],
    };
  }
}
