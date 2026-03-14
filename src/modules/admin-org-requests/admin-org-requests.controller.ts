import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOrgRequestsService } from './admin-org-requests.service';

/**
 * AdminOrgRequestsController
 *
 * Will handle (SUPER_ADMIN only):
 *   GET    /api/v1/admin/org-requests            → list all pending requests
 *   POST   /api/v1/admin/org-requests/:id/approve → approve → creates Organization + promotes user to ORG_ADMIN
 *   POST   /api/v1/admin/org-requests/:id/reject  → reject with reason
 *
 * Auth: JWT required, role SUPER_ADMIN
 */
@ApiTags('Admin — Org Requests')
@Controller('admin/org-requests')
export class AdminOrgRequestsController {
  constructor(
    private readonly adminOrgRequestsService: AdminOrgRequestsService,
  ) {}

  // Endpoints will be implemented in TASK 2
}
