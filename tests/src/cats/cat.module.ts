import { Module } from '@nestjs/common';
import { MongooseModule } from '../../../lib';
import { Cat, CatSchema } from './schemas/cat.schema';
import { CatController } from './cat.controller';
import { CatService } from './cat.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }])],
  controllers: [CatController],
  providers: [CatService],
})
export class CatModule {}
