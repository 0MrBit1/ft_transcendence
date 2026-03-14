import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * NotificationsService
 *
 * Will handle:
 *   - Create notification (called by other services: org approval, booking, event publish)
 *   - List user's notifications (paginated, newest first)
 *   - Mark as read / mark all as read
 *   - Unread count
 *
 * Works with: notifications
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Business logic will be implemented in TASK 2
}
