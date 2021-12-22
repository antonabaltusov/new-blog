import { Injectable } from '@nestjs/common';
import { Comment } from './comments/comments.service';

export interface News {
  id: number;
  title: string;
  description: string;
  author: string;
  countView?: number;
  comments?: Comment[];
  cover?: string;
}

export interface EditNews {
  id: number;
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
      title: 'dfvefv',
      description: 'evefvefv',
      author: 'erver',
      countView: 7,
      cover:
        'https://cdnn21.img.ria.ru/images/148839/93/1488399309_0:0:3000:2086_600x0_80_0_1_7692b9d464b76425cdcbb70c37a76884.jpg.webp',
    },
  ];

  create(news: News): News {
    const id = getRandomInt(0, 99999);
    const finalNews = {
      ...news,
      id: id,
    };

    this.news.push(finalNews);
    console.log(this.news);
    return finalNews;
  }

  edit(newNews: EditNews): boolean {
    const indexEdit = this.news.findIndex((news) => news.id === newNews.id);
    if (indexEdit !== -1) {
      this.news[indexEdit] = {
        ...this.news[indexEdit],
        ...newNews,
      };
      return true;
    }
    return false;
  }

  find(id: number): News | undefined {
    console.log(this.news);
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
