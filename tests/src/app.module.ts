import { Module } from '@nestjs/common';
import { MongooseModule } from '../../lib';
import { CatsModule } from './cats/cats.module';
import { DogsModule } from './dogs/dogs.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://root:root@localhost:27017'),
    MongooseModule.forRootDynamicConnection({
      resolver(dynamicKey) {
        if (dynamicKey === 'dogs.com') {
          return { uri: 'mongodb://root:root@localhost:27017', dbName: 'dogs' };
        }

        return {
          uri: 'mongodb://root:root@localhost:27017',
          dbName: 'global-dogs',
        };
      },
    }),
    CatsModule,
    DogsModule,
  ],
})
export class AppModule {}
