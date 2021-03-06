import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger, UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { WsJwtGuard } from '../../auth/ws-jwt.guard';
import { CommentsService } from './comments.service';
import { UsersService } from '../../users/users.service';
import { EventsComment } from './EventsComment.enum';
import { EventsNews } from '../EventsNews.enum';

export type Comment = { message: string; idNews: number };

@WebSocketGateway()
export class SocketCommentsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly commentsService: CommentsService,
    private readonly userService: UsersService,
  ) {}
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('addComment')
  async handleMessage(client: Socket, comment: Comment): Promise<void> {
    const { idNews, message } = comment;
    const userId: number = client.data.user.id;
    const _comment = await this.commentsService.create(idNews, message, userId);
    this.server.to(idNews.toString()).emit('newComment', _comment);
  }

  @OnEvent(EventsComment.remove)
  handleRemoveCommentEvent(payload) {
    const { idNews, idComment } = payload;
    this.server.to(idNews.toString()).emit('removeComment', { id: idComment });
  }

  @OnEvent(EventsComment.edit)
  async handleEditCommentEvent(payload) {
    const { commentMessage, idComment, idNews } = payload;
    this.server.to(idNews.toString()).emit('editComment', {
      commentId: idComment,
      commentMessage: commentMessage,
    });
  }
  
  @OnEvent(EventsNews.remove)
  handleRemoveNewsEvent(payload) {
    const { idNews } = payload;
    this.server.to(idNews.toString()).emit('removeNews');
  }

  @OnEvent(EventsNews.edit)
  async handleEditNewsEvent(payload) {
    const { idNews, news } = payload;
    console.log(news);
    this.server.to(idNews.toString()).emit('editNews', {
      news: news,
    });
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async handleConnection(client: Socket, ...args: any[]): Promise<void> {
    const { newsId } = client.handshake.query;
    client.join(newsId);
    this.logger.log(`Client connected: ${client.id}`);
  }
}
