import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;                        // the Socket.IO server instance

  constructor(private chatService: ChatService) {} // inject the chat service to access DB
  // ─── user joins a room ───────────────────────────────────────────
  @SubscribeMessage('join_event')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { eventId: string; userId: string },
  ) {
    const room = `event:${payload.eventId}`;  // room name like event:42

    // TODO: replace this mock with real booking check (Mouad's service)
    const hasConfirmedBooking = true;

    if (!hasConfirmedBooking) {
      client.emit('error', { message: 'Access denied' });
      return;
    }

    client.join(room);                         // socket joins the room
    client.emit('joined', { room });           // confirm to the user
    console.log(`User ${payload.userId} joined ${room}`);
  }

  // ─── user sends a message ────────────────────────────────────────
  @SubscribeMessage('send_message')
async handleMessage(
  @ConnectedSocket() client: Socket,
  @MessageBody() body: { eventId: string; userId: string; username: string; content: string },
) {
  // save to DB
  const saved = await this.chatService.saveMessage({
    eventId: body.eventId,
    userId: body.userId,
    username: body.username,
    content: body.content,
  });

  // broadcast to room
  this.server.to(`event:${body.eventId}`).emit('new_message', saved);
  // TODO: call moderation service (Prizmo)
}

  // ─── user leaves or disconnects ──────────────────────────────────
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Socket.IO removes them from all rooms automatically
  }
}