import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Comment, CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}

  @Post('/api/:idNews')
  create(@Param('idNews') idNews: string, @Body() comment: Comment) {
    const idNewsInt = parseInt(idNews);
    return this.commentService.create(idNewsInt, comment);
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
    return this.commentService.removeAll(idNews);
  }
}
