import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { BookingsModule } from './bookings/bookings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module'; // i add this import (youssef)

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
    EventsModule,
    BookingsModule,
    NotificationsModule,
    ChatModule, // i add this model (youssef)
  ],
})
export class AppModule { }
