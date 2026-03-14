import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrgDashboardService } from './org-dashboard.service';

/**
 * OrgDashboardController
 *
 * Will handle:
 *   GET /api/v1/org-dashboard/stats       → org stats (total events, bookings, members)
 *   GET /api/v1/org-dashboard/events       → org's events with booking counts
 *   GET /api/v1/org-dashboard/events/:id/attendees → attendee list for an event
 *
 * Auth: JWT required, role ORG_ADMIN
 */
@ApiTags('Org Dashboard')
@Controller('org-dashboard')
export class OrgDashboardController {
  constructor(private readonly orgDashboardService: OrgDashboardService) {}

  // Endpoints will be implemented in TASK 2
}
