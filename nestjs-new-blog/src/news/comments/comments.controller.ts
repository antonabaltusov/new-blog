import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Render,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from 'src/users/users.service';
import { HelperFileLoader } from 'src/utils/HelperFileLoader';
import { NewsService } from '../news.service';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dtos/create-comment-dto';
import { EditCommentDto } from './dtos/edit-comment-dto';

const PATH_NEWS = '/news-static/';
HelperFileLoader.path = PATH_NEWS;

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentService: CommentsService,
    private readonly newsService: NewsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('create/:id')
  @Render('create-comment')
  createView(
    @Param('id', ParseIntPipe) id: number,
    @Query('idComment') idComment: string,
  ) {
    const idCommentInt = parseInt(idComment);
    return { id, idCommentInt, title: 'создание комментария' };
  }

  @Get('/:idNews')
  @Render('comment-list')
  async get(@Param('idNews', ParseIntPipe) idNews: number) {
    const comments = await this.commentService.findByNewsId(idNews);
    console.log(comments);
    return { comments, idNews, title: `комментарии` };
  }


  @Post('/api/:idNews')
  @UseInterceptors(FileInterceptor('comment'))
  async create(
    @Param('idNews', ParseIntPipe) idNews: number,
    @Query('idComment') idComment: string,
    @Body() comment: CreateCommentDto,
  ) {
    const _user = await this.usersService.findById(parseInt(comment.authorId));
    if (!_user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Не существует такого автора',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const _news = await this.newsService.findById(idNews);
    if (!_news) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Новость была не найдена',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (idComment) {
      const _comment = await this.commentService.findById(parseInt(idComment));
      if (!_comment) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Комментарий была не найдена',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }
    return await this.commentService.create(_news, comment, idComment);
  }

  // 

  // @Delete('/api/:idNews/:idComment')
  // remove(
  //   @Param('idNews') idNews: string,
  //   @Param('idComment') idComment: string,
  // ) {
  //   const idNewsInt = parseInt(idNews);
  //   const idCommentInt = parseInt(idComment);
  //   return this.commentService.remove(idNewsInt, idCommentInt);
  // }

  // @Delete('/api/all')
  // removeAll(@Query('idNews') idNews: string): boolean {
  //   const idNewsInt = parseInt(idNews);
  //   return this.commentService.removeAll(idNewsInt);
  // }

  // @Patch('/api/:idNews/:idComment')
  // edit(
  //   @Param('idNews') idNews: string,
  //   @Param('idComment') idComment: string,
  //   @Body() news: EditCommentDto,
  // ): string {
  //   const idNewsInt = parseInt(idNews);
  //   const idCommentInt = parseInt(idComment);
  //   const isEdit = this.commentService.edit(idNewsInt, idCommentInt, news);
  //   return isEdit ? 'Новость изменена' : 'Передан неверный идентификатор';
  // }
}
