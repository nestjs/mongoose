import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '../../../lib';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) readonly model: Model<UserDocument>) {}
}
