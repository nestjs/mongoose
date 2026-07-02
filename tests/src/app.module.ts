import { Module } from '@nestjs/common';
import { MongooseModule } from '../../lib/index.js';
import { CatsModule } from './cats/cats.module.js';
import { CatModule } from './cats/cat.module.js';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/test'),
    CatsModule,
    CatModule,
  ],
})
export class AppModule {}
