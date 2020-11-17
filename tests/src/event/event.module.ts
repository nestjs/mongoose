import { Module } from '@nestjs/common';
import { MongooseModule } from '../../../lib';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Event, EventSchema } from './schemas/event.schema';
import {
  ClieckLinkEvent,
  ClieckLinkEventSchema,
} from './schemas/click-link-event.schema';
import { SignUpEvent, SignUpEventSchema } from './schemas/sign-up-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Event.name,
        schema: EventSchema,
        discriminators: [
          { name: ClieckLinkEvent.name, schema: ClieckLinkEventSchema },
          { name: SignUpEvent.name, schema: SignUpEventSchema },
        ],
      },
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
