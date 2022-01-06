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

  edit(newNews: EditNewsDto, id: number): boolean {
    const indexEdit = this.news.findIndex((news) => news.id === id);
    if (indexEdit !== -1) {
      this.news[indexEdit] = {
        ...this.news[indexEdit],
        ...newNews,
      };
      console.log(this.news[indexEdit]);
      return true;
    }
    return false;
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
