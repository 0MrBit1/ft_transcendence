# Bookings Module: Next Steps & Auth Integration Guide

This document outlines everything you need to add to the `Bookings` module to integrate it securely with User Authentication, Organizer permissions, and Notifications.

---

## 1. Connecting to User Authentication (`JwtAuthGuard`)

Currently, your endpoints accept a `userId` in the body or params. In a secure application, the `userId` is automatically extracted from the JWT token passed in the `Authorization: Bearer <token>` header.

### What to Add in `bookings.controller.ts`:

1. **Import the Guard and Request Decorator**
   ```typescript
   import { UseGuards, Req } from '@nestjs/common';
   import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Adjust path if your Auth module is elsewhere
   ```

2. **Protect the Endpoints**
   Add `@UseGuards(JwtAuthGuard)` above your endpoints (or above the entire Controller class if all routes should be protected).

3. **Extract `req.user` Instead of Using the DTO**
   Update the `book` method mapping.
   
   **Before:**
   ```typescript
   @Post('events/:eventId')
   book(@Param('eventId', ParseUUIDPipe) eventId: string, @Body() dto: CreateBookingDto) {
     return this.bookingsService.book(eventId, dto.userId);
   }
   ```
   **After:**
   ```typescript
   @UseGuards(JwtAuthGuard)
   @Post('events/:eventId')
   book(@Param('eventId', ParseUUIDPipe) eventId: string, @Req() req: any) {
     const userId = req.user.id; // Extracted automatically from the JWT
     return this.bookingsService.book(eventId, userId);
   }
   ```

   **Repeat this process** for the `GET /bookings/user/:userId` endpoint. Instead of passing `userId`, you should use `@Req() req` and fetch bookings for `req.user.id`.

---

## 2. Setting up Organizer Validation (Authorization)

Right now, *anyone* could technically call `PATCH /bookings/:id/confirm` if they know the booking ID. You need to ensure only the organizer of the event can confirm a booking.

### What to Add in `bookings.service.ts`:

Modify the `confirm` (and `findByEvent`) methods to accept the currently logged-in user ID and verify ownership.

**Example Update to `confirm`:**
```typescript
// Add userId to parameters
async confirm(bookingId: string, currentUserId: string) {
  const booking = await this.findOneOrThrow(bookingId);

  // Authorization Check: Is the current user the organizer of this event?
  const event = await this.prisma.event.findUnique({ where: { id: booking.eventId } });
  if (event.organizerId !== currentUserId) {
    throw new ForbiddenException('Only the event organizer can confirm bookings');
  }

  if (booking.status !== 'PENDING') {
    throw new BadRequestException('Only PENDING bookings can be confirmed.');
  }

  // ... rest of confirm logic
}
```
*(You will need to pass `req.user.id` from your controller into this service method as `currentUserId`.)*

---

## 3. Integrating Notifications

When a user books an event, or an organizer confirms the booking, a notification should be fired.

### What to Add in `bookings.service.ts`:

1. **Inject the `NotificationsService`**
   ```typescript
   import { NotificationsService } from '../notifications/notifications.service';

   @Injectable()
   export class BookingsService {
     constructor(
       private readonly prisma: PrismaService,
       private readonly notificationsService: NotificationsService // <-- Inject this
     ) {}
   ```
   *(Make sure to add `NotificationsModule` to the `imports: []` array inside `bookings.module.ts`!)*

2. **Fire Notifications on Booking & Confirmation**
   Inside the `book` method after the booking is created:
   ```typescript
   await this.notificationsService.create({
     userId: event.organizerId, // Notify the organizer
     title: 'New Booking Request',
     message: `A new user has requested to join ${event.title}.`,
     type: 'NEW_BOOKING'
   });
   ```

   Inside the `confirm` method after the status is updated:
   ```typescript
   await this.notificationsService.create({
     userId: booking.userId, // Notify the attendee
     title: 'Booking Confirmed',
     message: `Your booking for ${event.title} is confirmed!`,
     type: 'BOOKING_CONFIRMED'
   });
   ```

---

## What Should You Do Next?

Here is your checklist to finish the Bookings Integration:
1. [ ] Implement the `AuthModule` and `JwtStrategy` (if you haven't already).
2. [ ] Apply `JwtAuthGuard` across the `bookings.controller.ts` endpoints.
3. [ ] Pass `req.user.id` into your `bookings.service.ts` methods to enforce Organizer-only limitations.
4. [ ] Import the `NotificationsModule` into the `BookingsModule` and trigger alerts on status changes.
5. [ ] (Optional) Add `page` and `limit` pagination logic to `findByEvent` and `findByUser` so large lists don't crash your server.
