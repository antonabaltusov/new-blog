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
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
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

  @Get('/api/:idNews')
  async getAll(@Param('idNews', ParseIntPipe) idNews: number) {
    return await this.commentService.findByNewsId(idNews);
  }

  @Post('/api/:idNews')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('comment'))
  async create(
    @Param('idNews', ParseIntPipe) idNews: number,
    @Query('idComment') idComment: string,
    @Body() comment: CreateCommentDto,
    @Req() req,
  ) {
    const JwtUserId = req.user.userId;
    const _user = await this.usersService.findById(JwtUserId);
    if (!_user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Не существует такого автора',
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
    return await this.commentService.create(
      idNews,
      comment.message,
      JwtUserId,
      idComment,
    );
  }

  @Delete('/api/:idComment')
  async remove(@Param('idComment', ParseIntPipe) idComment: number) {
    return this.commentService.removeById(idComment);
  }

  @Delete('/api/all/:idNews')
  removeAllByNewsId(@Param('idNews') idNews: number) {
    return this.commentService.removeAllByNewsId(idNews);
  }

  @Patch('/api/:idComment')
  async edit(
    @Param('idComment', ParseIntPipe) idComment: number,
    @Body() comment: EditCommentDto,
  ): Promise<string> {
    const isEdit = await this.commentService.edit(idComment, comment.message);
    return isEdit ? 'Новость изменена' : 'Передан неверный идентификатор';
  }
}
