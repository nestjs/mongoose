import { Controller, Get, Param } from '@nestjs/common';
import { CatService } from './cat.service.js';
import { Cat } from './schemas/cat.schema.js';

@Controller('cat')
export class CatController {
  constructor(private readonly catService: CatService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Cat | null> {
    return this.catService.findOne(id);
  }
}
