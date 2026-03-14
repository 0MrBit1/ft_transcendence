import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * OrganizationsService
 *
 * Will handle:
 *   - Get org by ID (with member count)
 *   - List/add/remove members
 *   - Get org for current ORG_ADMIN user
 *
 * Works with: organizations, organization_members
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
