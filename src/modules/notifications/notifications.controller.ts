import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

/**
 * NotificationsController
 *
 * Will handle:
 *   GET    /api/v1/notifications           → list user's notifications (paginated)
 *   POST   /api/v1/notifications/:id/read  → mark as read
 *   POST   /api/v1/notifications/read-all  → mark all as read
 *   GET    /api/v1/notifications/unread-count → unread badge count
 *
 * Auth: JWT required
 */
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  // Endpoints will be implemented in TASK 2
}
