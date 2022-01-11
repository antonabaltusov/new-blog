import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../../users/users.service';
import { Repository } from 'typeorm';
import { NewsEntity } from '../news.entity';
import { NewsService } from '../news.service';
import { CommentsEntity } from './comments.entity';
import { CreateCommentDto } from './dtos/create-comment-dto';

export type Comment = {
  id?: number;
  message: string;
  authorId?: number;
  avatar?: string;
  reply?: Comment[];
  blockcomment?: boolean;
};

interface CommentsBase {
  [key: string]: Comment[];
}

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
  ) {}

  async create(
    _news: NewsEntity,
    comment: CreateCommentDto,
    idComment?: string,
  ) {
    const _user = await this.usersService.findById(parseInt(comment.authorId));
    const _newComment = new CommentsEntity();
    _newComment.message = comment.message;
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
    return this.commentsRepository.find({ where: { news: { id: idNews } } });
  }

  async removeById(id: number): Promise<boolean> {
    const _removeComment = await this.findById(id);
    if (_removeComment) {
      this.commentsRepository.remove(_removeComment);
      return true;
    }
    return false;
  }

  // removeAll(idNews: number): boolean {
  //   return delete this.comments?.[idNews];
  // }

  async edit(id: number, message: string): Promise<boolean> {
    let _editableComment = await this.findById(id);
    if (_editableComment) {
      _editableComment = {
        ..._editableComment,
        message,
      };
      return true;
    }
    return false;
  }
}
