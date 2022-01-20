import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../../users/users.service';
import { Repository } from 'typeorm';
import { NewsService } from '../news.service';
import { CommentsEntity } from './comments.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { checkPermission, Modules } from 'src/auth/role/unit/check-permission';
import { UsersEntity } from 'src/users/users.entity';
import { EventsComment } from './EventsComment.enum';

export type Comment = {
  id?: number;
  message: string;
  authorId?: number;
  avatar?: string;
  reply?: Comment[];
  blockcomment?: boolean;
};

export type EditComment = {
  message?: string;
  author?: string;
};

export function getRandomInt(min = 1, max = 99999): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsEntity)
    private commentsRepository: Repository<CommentsEntity>,
    private usersService: UsersService,
    private readonly newsService: NewsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    idNews: number,
    message: string,
    idUser: number,
    idComment?: string,
  ) {
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

  async findByNewsId(idNews: number): Promise<any> {
    return await this.commentsRepository.find({
      where: { news: { id: idNews } },
      relations: ['user'],
    });
  }

  async removeById(idComment: number, userId: number): Promise<CommentsEntity> {
    const _comment = await this.commentsRepository.findOne({
      where: { id: idComment },
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
      idComment: idComment,
      idNews: _comment.news.id,
    });

    return comment;
  }

  async removeByIdRole(idComment: number, userId: number): Promise<boolean> {
    const _comment = await this.commentsRepository.findOne({
      where: { id: idComment },
      relations: ['user'],
    });
    if (_comment) {
      const _user: UsersEntity = await this.usersService.findById(userId);
      if (
        checkPermission(Modules.isAdmin, _user.roles) ||
        _user.roles === _comment.user.roles
      ) {
        this.commentsRepository.remove(_comment);
        return true;
      }
    }
    return false;
  }

  removeAllByNewsId(idNews: number) {
    return this.commentsRepository.delete({ news: { id: idNews } });
  }

  async edit(
    idComment: number,
    message: string,
    idUser: number,
  ): Promise<boolean> {
    const _сomment = await this.commentsRepository.findOne({
      where: { id: idComment },
      relations: ['user'],
    });
    if (_сomment && _сomment.user.id === idUser) {
      _сomment.message = message;
      await this.commentsRepository.update(_сomment.id, _сomment);
      return true;
    }
    return false;
  }
}
