import { Injectable } from '@nestjs/common';
import { Comment } from './comments/comments.service';
import { CreateNewsDto } from './dtos/create-news-dto';
import { EditNewsDto } from './dtos/edit-news-dto';

export interface News {
  id?: number;
  title: string;
  description: string;
  author: string;
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

export function getRandomInt(min = 1, max = 99999): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

@Injectable()
export class NewsService {
  private readonly news: News[] = [
    {
      id: 2,
      title: 'ура',
      description: 'вот',
      author: 'антон',
      countView: 7,
      cover: '/news-static/0000.jpeg',
    },
  ];

  create(news: CreateNewsDto): CreateNewsDto {
    const id = getRandomInt(0, 99999);
    const finalNews = {
      ...news,
      id: id,
    };

    this.news.push(finalNews);
    return finalNews;
  }

  edit(newNews: EditNewsDto, id: number) {
    const indexEdit = this.news.findIndex((news) => news.id === id);
    const filtredNewNews = this.filter(this.news[indexEdit], newNews);
    const oldNews = this.news[indexEdit];
    if (indexEdit !== -1) {
      this.news[indexEdit] = {
        ...this.news[indexEdit],
        ...filtredNewNews,
      };
      return { change: true, news: oldNews, filterNewNews: filtredNewNews };
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

  find(id: number): News | undefined {
    return this.news.find((news) => news.id === id);
  }

  getAll(): News[] {
    return this.news;
  }

  remove(id: number): boolean {
    const indexRemove = this.news.findIndex((news) => news.id === id);
    if (indexRemove !== -1) {
      this.news.splice(indexRemove, 1);
      return true;
    }
    return false;
  }
}
