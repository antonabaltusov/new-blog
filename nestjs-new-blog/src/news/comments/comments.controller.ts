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
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { HelperFileLoader } from 'src/utils/HelperFileLoader';
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
    const JwtUserId = req.user.id;
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

  @UseGuards(JwtAuthGuard)
  @Delete('/api/:idComment')
  async remove(
    @Param('idComment', ParseIntPipe) idComment: number,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.commentService.removeById(idComment, userId);
  }

  @Delete('/api/all/:idNews')
  removeAllByNewsId(@Param('idNews') idNews: number) {
    return this.commentService.removeAllByNewsId(idNews);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/api/:idComment')
  async edit(
    @Req() req,
    @Param('idComment', ParseIntPipe) idComment: number,
    @Body() { message }: EditCommentDto,
  ) {
    return await this.commentService.edit(idComment, message, req.user.id);
  }
}
