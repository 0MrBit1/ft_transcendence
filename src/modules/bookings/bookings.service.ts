import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * BookingsService
 *
 * Will handle:
 *   - Book event: $transaction that checks remaining_capacity > 0,
 *     creates booking (CONFIRMED), decrements remaining_capacity
 *   - Cancel booking: restores remaining_capacity, sets status CANCELLED
 *   - Prevent duplicate bookings (unique constraint on event_id + user_id)
 *   - List user's bookings with event details
 *
 * Works with: bookings, events (remaining_capacity)
 */
@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Business logic will be implemented in TASK 2
}
