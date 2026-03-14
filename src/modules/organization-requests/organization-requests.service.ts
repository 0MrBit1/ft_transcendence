import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * OrganizationRequestsService
 *
 * Will handle:
 *   - Creating a new org request (with validation: no duplicate pending requests)
 *   - Fetching the current user's request + status
 *
 * Works with: organization_requests table
 */
@Injectable()
export class OrganizationRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  // Business logic will be implemented in TASK 2
}
