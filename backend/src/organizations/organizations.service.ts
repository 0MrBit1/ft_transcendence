import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * OrganizationsService
 *
 * Handles:
 *   - List all organizations
 *
 * TODO (merged from removed modules):
 *   - Organization Requests: create request, get user's request status
 *   - Admin Org Requests: list pending, approve (creates org + member + role), reject
 *   - Org Dashboard: aggregate stats, list org events, attendee list
 *
 * Works with: organizations, organization_requests, organization_members, users, events, bookings
 */
@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.organization.findMany({
      select: { id: true, name: true, description: true, logoUrl: true },
      orderBy: { name: 'asc' },
    });
  }
}
