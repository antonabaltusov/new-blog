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

  @Post('/api/:idNews')
  @UseInterceptors(
    FileInterceptor('avatar', {
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
    @Param('idNews') idNews: string,
    @Query('idComment') idComment: string,
    @Body() comment: CreateCommentDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    const idNewsInt = parseInt(idNews);
    if (this.newsService.find(idNewsInt)) {
      const idCommentInt = parseInt(idComment);
      if (avatar?.filename) {
        comment.avatar = PATH_NEWS + avatar.filename;
      }
      return this.commentService.create(idNewsInt, comment, idCommentInt);
    }
    return 'новость отсутствует';
  }

  @Get('/:idNews')
  @Render('comment-list')
  get(@Param('idNews') idNews: string) {
    const idNewsInt = parseInt(idNews);
    const comments = this.commentService.find(idNewsInt);
    return { comments, idNews, title: `комментарии` };
  }

  @Delete('/api/:idNews/:idComment')
  remove(
    @Param('idNews') idNews: string,
    @Param('idComment') idComment: string,
  ) {
    const idNewsInt = parseInt(idNews);
    const idCommentInt = parseInt(idComment);
    return this.commentService.remove(idNewsInt, idCommentInt);
  }

  @Delete('/api/all')
  removeAll(@Query('idNews') idNews: string): boolean {
    const idNewsInt = parseInt(idNews);
    return this.commentService.removeAll(idNewsInt);
  }

  @Patch('/api/:idNews/:idComment')
  edit(
    @Param('idNews') idNews: string,
    @Param('idComment') idComment: string,
    @Body() news: EditCommentDto,
  ): string {
    const idNewsInt = parseInt(idNews);
    const idCommentInt = parseInt(idComment);
    const isEdit = this.commentService.edit(idNewsInt, idCommentInt, news);
    return isEdit ? 'Новость изменена' : 'Передан неверный идентификатор';
  }
}
