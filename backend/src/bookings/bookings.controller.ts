import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ─── Book an event ─────────────────────────────────────────────────────────

  @Post('events/:eventId')
  @ApiOperation({ summary: 'Book an event (capacity-safe, creates PENDING booking)' })
  book(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.book(eventId, dto.userId);
  }

  // ─── List bookings for an event ────────────────────────────────────────────

  @Get('events/:eventId')
  @ApiOperation({ summary: 'List all bookings for an event' })
  findByEvent(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.bookingsService.findByEvent(eventId);
  }

  // ─── List bookings for a user ──────────────────────────────────────────────

  @Get('user/:userId')
  @ApiOperation({ summary: "List a user's bookings" })
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.bookingsService.findByUser(userId);
  }

  // ─── Get a single booking ─────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.findOne(id);
  }

  // ─── Confirm a booking ─────────────────────────────────────────────────────

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm a pending booking (organizer action)' })
  confirm(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.confirm(id);
  }

  // ─── Cancel a booking ──────────────────────────────────────────────────────

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking (restores event capacity)' })
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.cancel(id);
  }
}
