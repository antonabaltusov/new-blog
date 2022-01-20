import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import * as cookie from 'cookie';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger, UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { WsJwtGuard } from '../../auth/ws-jwt.guard';
import { CommentsService } from './comments.service';
import { UsersEntity } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { checkPermission, Modules } from 'src/auth/role/unit/check-permission';
import { EventsComment } from './EventsComment.enum';

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
  async handleMessage(client: Socket, comment: Comment):Promise<void> {
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

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('comment.edit')
  async handleEditCommentEvent(client: Socket, payload) {
    const { commentMessage, commentId, newsId } = payload;
    if (
      await this.commentsService.edit(
        commentId,
        commentMessage,
        client.data.user.id,
      )
    ) {
      this.server.to(newsId.toString()).emit('editComment', {
        commentId: commentId,
        commentMessage: commentMessage,
      });
    }
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async handleConnection(client: Socket, ...args: any[]):Promise<void> {
    const { newsId } = client.handshake.query;
    // После подключения пользователя к веб-сокету, подключаем его в комнату
    client.join(newsId);
    this.logger.log(`Client connected: ${client.id}`);
  }
}
