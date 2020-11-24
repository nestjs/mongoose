import { DynamicModule, Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';

@Module({})
export class EventModule {
  static forFeature(module: DynamicModule): DynamicModule {
    return {
      imports: [module],
      module: EventModule,
      controllers: [EventController],
      providers: [EventService],
    };
  }
}
