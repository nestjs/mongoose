import { Module } from '@nestjs/common';
import { MongooseModule } from '../../../../lib';
import { Region, RegionSchema } from './region.schema';
import { RegionService } from './region.service';
import {
  EventBase,
  EventBaseSchema,
  FloodEvent,
  FloodSchema,
} from './event/event.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EventBase.name,
        schema: EventBaseSchema,
        discriminators: [
          { name: FloodEvent.name, schema: FloodSchema, value: 'flood' },
        ],
      },
      { name: Region.name, schema: RegionSchema },
    ]),
  ],
  providers: [RegionService],
  exports: [RegionService],
})
export class RegionModule {}
