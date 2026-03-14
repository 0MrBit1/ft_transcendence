import { Module } from '@nestjs/common';
import { OrganizationRequestsController } from './organization-requests.controller';
import { OrganizationRequestsService } from './organization-requests.service';

@Module({
  controllers: [OrganizationRequestsController],
  providers: [OrganizationRequestsService],
  exports: [OrganizationRequestsService],
})
export class OrganizationRequestsModule {}
