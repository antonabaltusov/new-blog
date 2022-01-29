import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../../users/users.service';
import { DeleteResult, Repository } from 'typeorm';
import { NewsService } from '../news.service';
import { CommentsEntity } from './comments.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  checkPermission,
  Modules,
} from '../../auth/role/unit/check-permission';
import { EventsComment } from './EventsComment.enum';

export type Comment = {
  id?: number;
  message: string;
  authorId?: number;
  avatar?: string;
  reply?: Comment[];
  blockcomment?: boolean;
};

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsEntity)
    private commentsRepository: Repository<CommentsEntity>,
    private readonly usersService: UsersService,
    private readonly newsService: NewsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    idNews: number,
    message: string,
    idUser: number,
    idComment?: string,
  ): Promise<CommentsEntity> {
    const _news = await this.newsService.findById(idNews);
    if (!_news) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Новость была не найдена',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const _user = await this.usersService.findById(idUser);
    const _newComment = new CommentsEntity();
    _newComment.message = message;
    _newComment.user = _user;
    _newComment.news = _news;
    // if (idComment) {
    //   const _comment = await this.findById(parseInt(idComment));
    //   _newComment.comment = _comment;
    //   console.log(_newComment.id);
    //   await this.commentsRepository.save(_newComment);
    //   console.log(await this.commentsRepository.findOne(_newComment));
    //   _comment.answer = await this.commentsRepository.findOne(_newComment);
    //   return true;
    // }
    return await this.commentsRepository.save(_newComment);
  }

  async findById(id: number): Promise<CommentsEntity> {
    return this.commentsRepository.findOne(id);
  }

  async findByNewsId(idNews: number): Promise<CommentsEntity[]> {
    return await this.commentsRepository.find({
      where: { news: { id: idNews } },
      relations: ['user'],
    });
  }

  async removeById(id: number, userId: number): Promise<CommentsEntity> {
    const _comment = await this.commentsRepository.findOne(id, {
      relations: ['user', 'news'],
    });
    if (!_comment) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Комментарий не найден',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const _user = await this.usersService.findById(userId);

    if (
      _user.id !== _comment.user.id &&
      !checkPermission(Modules.editComment, _user.roles)
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Недостаточно прав для удаления',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const comment = await this.commentsRepository.remove(_comment);
    this.eventEmitter.emit(EventsComment.remove, {
      idComment: id,
      idNews: _comment.news.id,
    });

    return comment;
  }

  async removeAllByNewsId(idNews: number): Promise<CommentsEntity[]> {
    const comments = await this.commentsRepository.find({
      where: { news: { id: idNews } },
    });
    return await this.commentsRepository.remove(comments);
  }

  async edit(
    id: number,
    message: string,
    idUser: number,
  ): Promise<CommentsEntity> {
    const _comment = await this.commentsRepository.findOne(id, {
      relations: ['user', 'news'],
    });

    if (!_comment) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Комментарий не найден',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (idUser !== _comment.user.id) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Недостаточно прав для редактирования',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    _comment.message = message;
    const comment = await this.commentsRepository.save(_comment);
    this.eventEmitter.emit(EventsComment.edit, {
      idComment: id,
      idNews: _comment.news.id,
      commentMessage: message,
    });
    return comment;
  }
}
