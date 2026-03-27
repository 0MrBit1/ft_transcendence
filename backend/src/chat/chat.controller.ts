import { Controller, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  getChatHistory(@Query('eventId') eventId: string, @Query('cursor') cursor?: string) {
    return this.chatService.getHistory(eventId, cursor);
  }
}