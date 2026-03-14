import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';

/**
 * BookingsController
 *
 * Will handle:
 *   POST   /api/v1/bookings/events/:eventId  → book an event (capacity-safe)
 *   GET    /api/v1/bookings/mine              → list my bookings
 *   POST   /api/v1/bookings/:id/cancel        → cancel my booking (restores remaining_capacity)
 *
 * Auth: JWT required, role USER
 */
@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Endpoints will be implemented in TASK 2
}
