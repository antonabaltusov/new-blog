import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Render,
  ParseIntPipe,
} from '@nestjs/common';
import { News, NewsService } from './news.service';
import { CommentsService } from './comments/comments.service';
import { CreateNewsDto } from './dtos/create-news-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { HelperFileLoader } from 'src/utils/HelperFileLoader';
import { EditNewsDto } from './dtos/edit-news-dto';
import { extname } from 'path';

const PATH_NEWS = '/news-static/';
HelperFileLoader.path = PATH_NEWS;

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly commentsServise: CommentsService,
  ) {}

  @Get('/all')
  @Render('news-list')
  getAllView() {
    const news = this.newsService.getAll();
    return { news, title: 'Список новостей' };
  }

  @Get('edit/news/:id')
  @Render('edit-news')
  editView(@Param('id') id: string) {
    const idInt = parseInt(id);
    const news = this.newsService.find(idInt);
    return { news, title: 'Редактирование новости' };
  }

  @Get('create/news')
  @Render('create-news')
  createView() {
    return { title: 'создание новости' };
  }

  @Get('/:id/detail')
  @Render('detail-news')
  detailView(@Param('id') id: string) {
    const idInt = parseInt(id);
    const news = this.newsService.find(idInt);
    const comments = this.commentsServise.find(idInt);
    return { news, comments, title: news ? news.title : 'новость отсутствует' };
  }

  @Get('/api/all')
  getAll(): News[] {
    return this.newsService.getAll();
  }

  @Get('/api/:id')
  get(@Param('id') id: string): News | string {
    const idInt = parseInt(id);
    const news = this.newsService.find(idInt);
    const comments = this.commentsServise.find(idInt);
    if (comments && news) {
      return {
        ...news,
        comments,
      };
    }
    return 'новость не найдена';
  }

  @Post('/api')
  @UseInterceptors(
    FileInterceptor('cover', {
      fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(
            new HttpException(
              `Unsupported file type ${extname(file.originalname)}`,
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
      },
      storage: diskStorage({
        destination: HelperFileLoader.destinationPath,
        filename: HelperFileLoader.customFileName,
      }),
    }),
  )
  create(
    @Body() news: CreateNewsDto,
    @UploadedFile() cover: Express.Multer.File,
  ): News {
    if (cover?.filename) {
      news.cover = PATH_NEWS + cover.filename;
    }
    console.log(news);
    return this.newsService.create(news);
  }

  @Delete('/api/:id')
  remove(@Param('id') id: string): string {
    const idInt = parseInt(id);
    const isRemove =
      this.newsService.remove(idInt) && this.commentsServise.removeAll(idInt);
    return isRemove ? 'Новость удалена' : 'Передан неверный идентификатор';
  }

  @Patch('/api/:id')
  @UseInterceptors(FileInterceptor('news'))
  edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() news: EditNewsDto,
  ): string {
    console.log(news);
    const isChange = this.newsService.edit(news, id);
    return isChange ? 'Новость изменена' : 'Передан неверный идентификатор';
  }
}
