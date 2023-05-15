import { Module } from '@nestjs/common';
import { MongooseModule } from '../../../lib';
import { Person, PersonSchema } from './person.schema';
import { PersonService } from './person.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Person.name, schema: PersonSchema }]),
  ],
  providers: [PersonService],
  exports: [PersonService],
})
export class PersonModule {}
