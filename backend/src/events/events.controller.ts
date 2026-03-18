import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event for an organization' })
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List published events (with optional filters)' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag' })
  @ApiQuery({ name: 'type', required: false, enum: ['PUBLIC', 'PRIVATE'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('tag') tag?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.eventsService.findAll({
      tag,
      type,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('all')
  @ApiOperation({ summary: '[Debug] List ALL events regardless of status' })
  findAllDebug() {
    return this.eventsService.findAllDebug();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event details by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish an event (transitions from DRAFT to PUBLISHED)' })
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.publish(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an event (transitions to CANCELLED)' })
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.cancel(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event details' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a draft or cancelled event' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.remove(id);
  }
}
