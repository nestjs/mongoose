import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '../../../lib';
import { Story, StoryDocument } from './story.schema';

@Injectable()
export class StoryService {
  constructor(@InjectModel(Story.name) readonly model: Model<StoryDocument>) {}
}
