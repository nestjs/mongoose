import { Module } from '@nestjs/common';
import { MongooseModule } from '../../lib/index.js';
import { CatsModule } from './cats/cats.module.js';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/test', {
      lazyConnection: true,
    }),
    CatsModule,
  ],
})
export class LazyAppModule {}
