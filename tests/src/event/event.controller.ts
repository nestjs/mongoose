import { Body, Controller, Get, Post } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateClickLinkEventDto } from './dto/create-click-link-event.dto';
import { CreateSignUpEventDto } from './dto/create-sign-up-event.dto';
import { Event } from './schemas/event.schema';
import { ClieckLinkEvent } from './schemas/click-link-event.schema';
import { SignUpEvent } from './schemas/sign-up-event.schema';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('click-link')
  async createClickLinkEvent(
    @Body() dto: CreateClickLinkEventDto,
  ): Promise<unknown> {
    return this.eventService.create({
      ...dto,
      time: new Date(),
      kind: ClieckLinkEvent.name,
    });
  }

  @Post('sign-up')
  async create(@Body() dto: CreateSignUpEventDto): Promise<unknown> {
    return this.eventService.create({
      ...dto,
      time: new Date(),
      kind: SignUpEvent.name,
    });
  }

  @Get()
  async findAll(): Promise<Event[]> {
    return this.eventService.findAll();
  }
}
