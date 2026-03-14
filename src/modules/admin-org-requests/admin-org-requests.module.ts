import { Module } from '@nestjs/common';
import { AdminOrgRequestsController } from './admin-org-requests.controller';
import { AdminOrgRequestsService } from './admin-org-requests.service';

@Module({
  controllers: [AdminOrgRequestsController],
  providers: [AdminOrgRequestsService],
  exports: [AdminOrgRequestsService],
})
export class AdminOrgRequestsModule {}
