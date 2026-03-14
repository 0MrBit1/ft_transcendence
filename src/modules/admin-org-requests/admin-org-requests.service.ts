import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * AdminOrgRequestsService
 *
 * Will handle:
 *   - Listing pending org requests (for SUPER_ADMIN review)
 *   - Approving a request → $transaction: update request status, create Organization,
 *     create OrganizationMember(ADMIN), update user role to ORG_ADMIN, send notification
 *   - Rejecting a request → update status + record reason + send notification
 *
 * Works with: organization_requests, organizations, organization_members, users, notifications
 */
@Injectable()
export class AdminOrgRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  // Business logic will be implemented in TASK 2
}
