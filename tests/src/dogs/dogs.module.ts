import { Module } from '@nestjs/common';
import { MongooseModule } from '../../../lib';
import { DogsController } from './dogs.controller';
import { DogsService } from './dogs.service';
import { Dog, DogSchema } from './schemas/dog.schema';

@Module({
  imports: [
    MongooseModule.forFeatureDynamic({
      models: [{ name: Dog.name, schema: DogSchema }],
    }),
  ],
  controllers: [DogsController],
  providers: [DogsService],
})
export class DogsModule {}
