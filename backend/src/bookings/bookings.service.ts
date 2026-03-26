import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Book an event (capacity-safe) ─────────────────────────────────────────

  async book(eventId: string, userId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Verify event exists and is PUBLISHED
        const event = await tx.event.findUnique({ where: { id: eventId } });
        if (!event) {
          throw new NotFoundException('Event not found');
        }
        if (event.status !== 'PUBLISHED') {
          throw new BadRequestException(
            'Can only book published events',
          );
        }

        // 2. Check capacity (null = unlimited)
        if (event.capacity !== null) {
          if (event.remainingCapacity === null || event.remainingCapacity <= 0) {
            throw new BadRequestException('Event is full');
          }

          // Decrement remaining capacity
          await tx.event.update({
            where: { id: eventId },
            data: { remainingCapacity: { decrement: 1 } },
          });
        }

        // 3. Create booking with PENDING status
        const booking = await tx.booking.create({
          data: {
            eventId,
            userId,
            status: 'PENDING',
          },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startTime: true,
                remainingCapacity: true,
                capacity: true,
              },
            },
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        });

        return booking;
      });
    } catch (error) {
      // Catch Prisma unique constraint violation → duplicate booking
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('You have already booked this event');
      }
      throw error;
    }
  }

  // ─── Confirm a booking (organizer action) ──────────────────────────────────

  async confirm(bookingId: string) {
    const booking = await this.findOneOrThrow(bookingId);

    if (booking.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot confirm a booking with status "${booking.status}". Only PENDING bookings can be confirmed.`,
      );
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: {
        event: {
          select: { id: true, title: true, startTime: true, capacity: true, remainingCapacity: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  // ─── Cancel a booking (restores capacity) ──────────────────────────────────

  async cancel(bookingId: string) {
    const booking = await this.findOneOrThrow(bookingId);

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    return this.prisma.$transaction(async (tx) => {
      // Restore capacity if event has a capacity limit
      const event = await tx.event.findUnique({
        where: { id: booking.eventId },
      });

      if (event && event.capacity !== null) {
        await tx.event.update({
          where: { id: booking.eventId },
          data: { remainingCapacity: { increment: 1 } },
        });
      }

      return tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
        include: {
          event: {
            select: { id: true, title: true, startTime: true, capacity: true, remainingCapacity: true },
          },
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });
    });
  }

  // ─── List bookings for an event ────────────────────────────────────────────

  async findByEvent(eventId: string) {
    // Verify event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const bookings = await this.prisma.booking.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return { data: bookings, meta: { total: bookings.length, eventId } };
  }

  // ─── List bookings for a user ──────────────────────────────────────────────

  async findByUser(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            location: true,
            locationType: true,
            status: true,
            capacity: true,
            remainingCapacity: true,
          },
        },
      },
    });

    return { data: bookings, meta: { total: bookings.length, userId } };
  }

  // ─── Get single booking ───────────────────────────────────────────────────

  async findOne(bookingId: string) {
    return this.findOneOrThrow(bookingId);
  }

  // ─── Helper ────────────────────────────────────────────────────────────────

  private async findOneOrThrow(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            location: true,
            locationType: true,
            status: true,
            capacity: true,
            remainingCapacity: true,
          },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }
}
