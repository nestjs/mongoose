import * as mongoose from 'mongoose';
import { Module, DynamicModule, Global } from '@nestjs/common';
import { from } from 'rxjs';
import { handleRetry } from './mongoose.utils';

@Global()
@Module({})
export class MongooseCoreModule {
  static forRoot(uri: string, options: any = {}): DynamicModule {
    const connectionProvider = {
      provide: 'DbConnectionToken',
      useFactory: async (): Promise<any> =>
        await from(mongoose.connect(uri, options))
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
