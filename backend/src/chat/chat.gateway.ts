import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;                        // the Socket.IO server instance

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
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { eventId: string; userId: string; content: string },
  ) {
    const room = `event:${payload.eventId}`;

    const message = {
      userId: payload.userId,
      content: payload.content,
      createdAt: new Date(),
    };

    // broadcast ONLY to users in this event room
    this.server.to(room).emit('new_message', message);

    // TODO: save message to DB (Prisma)
    // TODO: call moderation service (Prizmo)
  }

  // ─── user leaves or disconnects ──────────────────────────────────
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Socket.IO removes them from all rooms automatically
  }
}