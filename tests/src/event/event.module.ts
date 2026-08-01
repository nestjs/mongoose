import { DynamicModule, Module } from '@nestjs/common';
import { EventService } from './event.service.js';
import { EventController } from './event.controller.js';

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
