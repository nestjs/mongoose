import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class IsObjectIdPipe implements PipeTransform {
  transform(value: string): string {
    const isValidObjectId = Types.ObjectId.isValid(value);

    if (!isValidObjectId) {
      throw new BadRequestException(
        `Invalid ObjectId: '${value}' is not a valid MongoDB ObjectId`,
      );
    }

    return value;
  }
}
