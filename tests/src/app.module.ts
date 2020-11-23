import { Module } from '@nestjs/common';
import { MongooseModule } from '../../lib';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/test'),
    CatsModule,
  ],
})
export class AppModule {}
