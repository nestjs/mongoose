import { Body, Controller, Get, Post } from '@nestjs/common';
import { LeanDocument } from 'mongoose';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './schemas/cat.schema';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto): Promise<LeanDocument<Cat>> {
    const cat = await this.catsService.create(createCatDto);
    return cat.toObject({ virtuals: true });
  }

  @Get()
  async findAll(): Promise<LeanDocument<Cat>[]> {
    const cats = await this.catsService.findAll();
    return cats.map((cat) => cat.toObject({ virtuals: true }));
  }
}
