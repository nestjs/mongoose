import { Module } from '@nestjs/common';
import { MongooseModule } from '../../../lib';
import { RegionModule } from './region/region.module';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/test'),
    RegionModule,
  ],
})
export class AppModule {}
