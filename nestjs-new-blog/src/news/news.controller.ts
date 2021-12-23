import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  Patch,
} from '@nestjs/common';
import { EditNews, News, NewsService } from './news.service';
import { CommentsService } from './comments/comments.service';
import { renderNewsAll } from '../views/news/news-all';
import { renderTemlate } from '../views/template';
import { renderNewsBlock } from 'src/views/news/news';
import { renderComments } from 'src/views/news/comments';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly commentsServise: CommentsService,
  ) {}

  @Get('/all')
  getAllView() {
    const news = this.newsService.getAll();
    const content = renderNewsAll(news);
    return renderTemlate(content, {
      title: 'список новостей',
      description: 'самые крутые новости',
    });
  }

  @Get('/:id/detail')
  getOneView(@Param('id') id: string) {
    const idInt = parseInt(id);
    const news = this.newsService.find(idInt);
    const comments = this.commentsServise.find(idInt);
    const isComments = comments ? true : false;
    const content = renderNewsBlock(news, isComments) + renderComments(comments);
    return renderTemlate(content, {
      title: 'Новость года',
      description: 'кратко и многом',
    });
  }

  @Get('/api/all')
  getAll(): News[] {
    return this.newsService.getAll();
  }

  @Get('/api/:id')
  get(@Param('id') id: string): News {
    const idInt = parseInt(id);
    const news = this.newsService.find(idInt);
    const comments = this.commentsServise.find(idInt);

    return {
      ...news,
      comments,
    };
  }

  @Post('/api')
  create(@Body() news: News): News {
    return this.newsService.create(news);
  }

  @Delete('/api/:id')
  remove(@Param('id') id: string): string {
    const idInt = parseInt(id);
    const isRemove =
      this.newsService.remove(idInt) && this.commentsServise.removeAll(idInt);
    return isRemove ? 'Новость удалена' : 'Передан неверный идентификатор';
  }

  @Patch('/api')
  edit(@Body() news: EditNews): string {
    const isChange = this.newsService.edit(news);
    return isChange ? 'Новость изменена' : 'Передан неверный идентификатор';
  }
}
