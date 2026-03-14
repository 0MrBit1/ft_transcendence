import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './common/prisma/prisma.module';
import { OrganizationRequestsModule } from './modules/organization-requests/organization-requests.module';
import { AdminOrgRequestsModule } from './modules/admin-org-requests/admin-org-requests.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { EventsModule } from './modules/events/events.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { OrgDashboardModule } from './modules/org-dashboard/org-dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    // Global config — reads .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Serve static files from /public
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api/(.*)'],
    }),

    // Infrastructure
    PrismaModule,

    // Feature modules
    OrganizationRequestsModule,
    AdminOrgRequestsModule,
    OrganizationsModule,
    EventsModule,
    BookingsModule,
    OrgDashboardModule,
    NotificationsModule,
  ],
})
export class AppModule {}
