import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { Comment } from './comments/comments.service';
import { CreateNewsDto } from './dtos/create-news-dto';
import { EditNewsDto } from './dtos/edit-news-dto';
import { EventsNews } from './EventsNews.enum';
import { NewsEntity } from './news.entity';
export interface News {
  id?: number;
  title: string;
  description: string;
  author?: string;
  countView?: number;
  cover?: string;
  comments?: Comment[];
}

export interface EditNews {
  title?: string;
  description?: string;
  author?: string;
  countView?: number;
}
export interface answerChange {
  change: boolean;
  filterNewNews?: EditNewsDto;
}

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private newsRepository: Repository<NewsEntity>,
    private readonly userServise: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(news: CreateNewsDto, userId: number): Promise<NewsEntity> {
    const newsEntity = new NewsEntity();
    newsEntity.title = news.title;
    newsEntity.description = news.description;
    newsEntity.cover = news.cover;
    const _user = await this.userServise.findById(userId);
    newsEntity.user = _user;
    return await this.newsRepository.save(newsEntity);
  }

  async edit(newNews: EditNewsDto, id: number, idUser: number) {
    const _editableNews = await this.findById(id);

    if (_editableNews.user.id !== idUser) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Недостаточно прав для редактирования',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const filtredNewNews = this.filter(_editableNews, newNews);
    if (!_editableNews) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'новость не найдена',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    _editableNews.title = newNews.title || _editableNews.title;
    _editableNews.description =
      newNews.description || _editableNews.description;
    _editableNews.cover = newNews.cover || _editableNews.cover;

    await this.newsRepository.save(_editableNews);

    this.eventEmitter.emit(EventsNews.edit, {
      news: _editableNews,
      idNews: _editableNews.id,
    });

    return {
      news: _editableNews,
      filterNewNews: filtredNewNews,
    };
  }

  filter(oldNews, newNews) {
    const filtredNewNews = {};
    for (const key in newNews) {
      if (newNews[key] !== oldNews[key] && !!newNews[key]) {
        filtredNewNews[key] = true;
      }
    }
    return filtredNewNews;
  }

  getAll(): Promise<NewsEntity[]> {
    return this.newsRepository.find({ relations: ['user'] });
  }

  findByUserId(idUser: number): Promise<NewsEntity[]> {
    return this.newsRepository.find({
      where: { user: { id: idUser } },
      relations: ['user'],
    });
  }

  async findById(id: number): Promise<NewsEntity> {
    const _news = await this.newsRepository.findOne(id, {
      relations: ['user'],
    });
    return _news;
  }

  async remove(id: number): Promise<NewsEntity> {
    const _news = await this.findById(id);
    if (!_news) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'новость не найдена',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const news = await this.newsRepository.remove(_news);
    this.eventEmitter.emit(EventsNews.remove, {
      idNews: id,
    });

    return news;
  }
}
