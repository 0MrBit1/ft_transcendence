import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {

  constructor(private prisma: PrismaService) {}

  // save message to DB
  async saveMessage(data: {
    eventId: string;
    userId: string;
    username: string;
    content: string;
  }) {
    return this.prisma.eventChatMessage.create({
      data,
    });
  }

  // get paginated history
  async getHistory(eventId: string, cursor?: string) {
    return this.prisma.eventChatMessage.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });
  }
}