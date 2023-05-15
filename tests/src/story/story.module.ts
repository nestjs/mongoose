import { Module } from '@nestjs/common';
import { MongooseModule } from '../../../lib';
import { Story, StorySchema } from './story.schema';
import { StoryService } from './story.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Story.name, schema: StorySchema }]),
  ],
  providers: [StoryService],
  exports: [StoryService],
})
export class StoryModule {}
