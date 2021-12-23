import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { query } from 'express';
import { Comment, CommentsService, EditComment } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}

  @Post('/api/:idNews')
  create(
    @Param('idNews') idNews: string,
    @Query('idComment') idComment,
    @Body() comment: Comment,
  ) {
    const idNewsInt = parseInt(idNews);
    const idCommentInt = parseInt(idComment);
    return this.commentService.create(idNewsInt, comment, idCommentInt);
  }

  @Get('/api/:idNews')
  get(@Param('idNews') idNews: string) {
    const idNewsInt = parseInt(idNews);
    return this.commentService.find(idNewsInt);
  }

  @Delete('/api/:idNews/:idComment')
  remove(
    @Param('idNews') idNews: string,
    @Param('idComment') idComment: string,
  ) {
    const idNewsInt = parseInt(idNews);
    const idCommentInt = parseInt(idComment);
    console.log(idNewsInt, idCommentInt);
    return this.commentService.remove(idNewsInt, idCommentInt);
  }

  @Delete('/api/all')
  removeAll(@Query('idNews') idNews): boolean {
    const idNewsInt = parseInt(idNews);
    return this.commentService.removeAll(idNewsInt);
  }

  @Patch('/api/:idNews/:idComment')
  edit(
    @Param('idNews') idNews: string,
    @Param('idComment') idComment: string,
    @Body() news: EditComment,
  ): string {
    const idNewsInt = parseInt(idNews);
    const idCommentInt = parseInt(idComment);
    const isEdit = this.commentService.edit(idNewsInt, idCommentInt, news);
    return isEdit ? 'Новость изменена' : 'Передан неверный идентификатор';
  }
}
