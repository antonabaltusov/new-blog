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
} from '@nestjs/common';
import { News, NewsService } from './news.service';
import { CommentsService } from './comments/comments.service';
import { renderNewsAll } from '../views/news/news-all';
import { renderTemlate } from '../views/template';
import { renderNewsBlock } from 'src/views/news/news';
import { renderComments } from 'src/views/news/comments';
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
    if (comments && news) {
      const content =
        renderNewsBlock(news, isComments) + renderComments(comments);
      return renderTemlate(content, {
        title: news.title,
        description: news.description,
      });
    }
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
    return 'новости не найдены';
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

    news.cover = PATH_NEWS + cover.filename;
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
  edit(@Body() news: EditNewsDto): string {
    const isChange = this.newsService.edit(news);
    return isChange ? 'Новость изменена' : 'Передан неверный идентификатор';
  }
}
