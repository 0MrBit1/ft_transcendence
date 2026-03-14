import { Module } from '@nestjs/common';
import { OrgDashboardController } from './org-dashboard.controller';
import { OrgDashboardService } from './org-dashboard.service';

@Module({
  controllers: [OrgDashboardController],
  providers: [OrgDashboardService],
  exports: [OrgDashboardService],
})
export class OrgDashboardModule {}
