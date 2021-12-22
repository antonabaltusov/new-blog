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

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('all')
  getAll(): News[] {
    return this.newsService.getAll();
  }

  @Get('/:id')
  get(@Param('id') id: string): News {
    const idInt = parseInt(id);
    return this.newsService.find(idInt);
  }

  @Post()
  create(@Body() news: News): News {
    return this.newsService.create(news);
  }

  @Delete('/:id')
  remove(@Param('id') id: string): string {
    const idInt = parseInt(id);
    const isRemove = this.newsService.remove(idInt);
    return isRemove ? 'Новость удалена' : 'Передан неверный идентификатор';
  }

  @Patch()
  change(@Body() news: EditNews): string {
    const isChange = this.newsService.change(news);
    return isChange ? 'Новость изменена' : 'Передан неверный идентификатор';
  }
}
