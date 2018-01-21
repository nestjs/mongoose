import * as mongoose from 'mongoose';
import { Module, DynamicModule, Global } from '@nestjs/common';

@Global()
@Module({})
export class MongooseCoreModule {
  static forRoot(
    uri: string,
    options: mongoose.ConnectionOptions = {},
  ): DynamicModule {
    const connectionProvider = {
      provide: 'DbConnectionToken',
      useFactory: async (): Promise<mongoose.Connection> =>
        await mongoose.connect(uri, options),
    };
    return {
      module: MongooseCoreModule,
      components: [connectionProvider],
      exports: [connectionProvider],
    };
  }
}
