import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all organizations' })
  findAll() {
    return this.organizationsService.findAll();
  }

  // ── TODO: Organization Requests ─────────────────────────
  // POST   /api/v1/organizations/requests       → submit a new org request
  // GET    /api/v1/organizations/requests/mine   → get my request status

  // ── TODO: Admin — Org Requests (SUPER_ADMIN) ────────────
  // GET    /api/v1/organizations/admin/requests            → list all pending requests
  // POST   /api/v1/organizations/admin/requests/:id/approve → approve
  // POST   /api/v1/organizations/admin/requests/:id/reject  → reject with reason

  // ── TODO: Org Dashboard (ORG_ADMIN) ─────────────────────
  // GET    /api/v1/organizations/dashboard/stats       → org stats
  // GET    /api/v1/organizations/dashboard/events      → org's events with booking counts
  // GET    /api/v1/organizations/dashboard/events/:id/attendees → attendee list
}
