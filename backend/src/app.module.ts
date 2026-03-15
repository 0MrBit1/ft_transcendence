import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { EventsModule } from './events/events.module';
import { BookingsModule } from './bookings/bookings.module';
import { NotificationsModule } from './notifications/notifications.module';

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
    OrganizationsModule,
    EventsModule,
    BookingsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
