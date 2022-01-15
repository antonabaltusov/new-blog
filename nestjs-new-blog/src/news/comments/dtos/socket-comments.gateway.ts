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
import { WsJwtGuard } from '../../../auth/ws-jwt.guard';
import { CommentsService } from '../comments.service';

export type Comment = { message: string; idNews: number };

@WebSocketGateway()
export class SocketCommentsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly commentsService: CommentsService) {}
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

  @OnEvent('comment.remove')
  handleRemoveCommentEvent(payload) {
    const { commentId, newsId } = payload;
    console.log(commentId, newsId);// тут надо сделать удаление
    this.server.to(newsId.toString()).emit('removeComment', { id: commentId });
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
