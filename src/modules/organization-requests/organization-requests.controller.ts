import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationRequestsService } from './organization-requests.service';

/**
 * OrganizationRequestsController
 *
 * Will handle:
 *   POST   /api/v1/organization-requests       → submit a new org request (USER signs up as org)
 *   GET    /api/v1/organization-requests/mine   → get my request status
 *
 * Auth: JWT required, role USER
 */
@ApiTags('Organization Requests')
@Controller('organization-requests')
export class OrganizationRequestsController {
  constructor(
    private readonly orgRequestsService: OrganizationRequestsService,
  ) {}

  // Endpoints will be implemented in TASK 2
}
