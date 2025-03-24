import { Module } from '@nestjs/common';
import { MongooseModule } from '../../lib';
import { CatsModule } from './cats/cats.module';
import { CatModule } from './cats/cat.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/test'),
    CatsModule,
    CatModule,
  ],
})
export class AppModule {}
