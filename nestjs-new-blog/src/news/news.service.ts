import { Injectable } from '@nestjs/common';

export interface News {
  id: number;
  title: string;
  description: string;
  author: string;
  countView?: number;
}

function getRandomInt(min: number, max: number): number {
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

  change(newNews: News): boolean {
    const currentNews = this.news.find((news) => news.id === newNews.id);
    if (currentNews) {
      const finalNews = {
        ...currentNews,
        ...newNews,
      };
      this.remove(newNews.id);
      this.news.push(finalNews);
      console.log(this.news);
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
