import { Module } from '@nestjs/common';
import { MongooseModule } from '../../../lib/index.js';
import { Cat, CatSchema } from './schemas/cat.schema.js';
import { CatController } from './cat.controller.js';
import { CatService } from './cat.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }])],
  controllers: [CatController],
  providers: [CatService],
})
export class CatModule {}
