import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * NotificationsService
 *
 * TODO:
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
}
