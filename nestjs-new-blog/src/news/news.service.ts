import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Comment } from './comments/comments.service';
import { CreateNewsDto } from './dtos/create-news-dto';
import { EditNewsDto } from './dtos/edit-news-dto';
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
    private userServise: UsersService,
  ) {}

  async create(news: CreateNewsDto): Promise<NewsEntity> {
    const newsEntity = new NewsEntity();
    newsEntity.title = news.title;
    newsEntity.description = news.description;
    newsEntity.cover = news.cover;
    const _user = await this.userServise.findById(parseInt(news.userId));
    newsEntity.user = _user;
    return await this.newsRepository.save(newsEntity);
  }

  async edit(newNews: EditNewsDto, id: number) {
    let _editableNews = await this.findById(id);
    const filtredNewNews = this.filter(_editableNews, newNews);
    if (_editableNews) {
      _editableNews = {
        ..._editableNews,
        ...filtredNewNews,
      };
      this.newsRepository.save(_editableNews);
      return {
        change: true,
        news: _editableNews,
        filterNewNews: filtredNewNews,
      };
    }
    return { change: false };
  }

  filter(oldNews, newNews) {
    const filtredNewNews = {};
    for (const key in newNews) {
      if (newNews[key] !== oldNews[key]) {
        filtredNewNews[key] = newNews[key];
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

  findById(id: number): Promise<NewsEntity> {
    return this.newsRepository.findOne({ id }, { relations: ['user'] });
  }

  async remove(id: number): Promise<boolean> {
    const removeNews = await this.findById(id);
    if (removeNews) {
      this.newsRepository.remove(removeNews);
      return true;
    }
    return false;
  }
}
