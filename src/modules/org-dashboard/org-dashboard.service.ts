import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * OrgDashboardService
 *
 * Will handle:
 *   - Aggregate stats for the ORG_ADMIN's organization
 *   - List org's events with booking counts
 *   - Get attendee list per event (for attendance management)
 *
 * Works with: organizations, events, bookings, organization_members
 */
@Injectable()
export class OrgDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Business logic will be implemented in TASK 2
}
