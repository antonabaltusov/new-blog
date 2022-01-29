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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Role } from '../../auth/role/role.enum';
import { Roles } from '../../auth/role/roles.decorator';
import { UsersService } from '../../users/users.service';
import { HelperFileLoader } from '../../utils/HelperFileLoader';
import { DeleteResult } from 'typeorm';
import { CommentsEntity } from './comments.entity';
import { CommentsService } from './comments.service';
import { CommentDto } from './dtos/comment-dto';

const PATH_NEWS = '/news-static/';
HelperFileLoader.path = PATH_NEWS;

@ApiBearerAuth()
@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentService: CommentsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('/api/:idNews')
  @ApiOperation({ summary: 'получение списка комментариев новости' })
  @ApiResponse({
    status: 200,
    description: 'Список комментариев',
    type: [CommentsEntity],
  })
  async getAll(
    @Param('idNews', ParseIntPipe) idNews: number,
  ): Promise<CommentsEntity[]> {
    return await this.commentService.findByNewsId(idNews);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/api/:idNews')
  @ApiOperation({ summary: 'Создания комментария' })
  @ApiResponse({
    status: 200,
    description: 'комментарий создан',
    type: CommentsEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Не существует такого автора' })
  @ApiResponse({ status: 404, description: 'Комментарий был не найден' })
  @ApiResponse({ status: 404, description: 'Новость была не найдена.' })
  @ApiBody({ type: CommentDto })
  @UseInterceptors(FileInterceptor('comment'))
  async create(
    @Param('idNews', ParseIntPipe) idNews: number,
    // @Query('idComment') idComment: string,
    @Body() comment: CommentDto,
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
    // if (idComment) {
    //   const _comment = await this.commentService.findById(parseInt(idComment));
    //   if (!_comment) {
    //     throw new HttpException(
    //       {
    //         status: HttpStatus.NOT_FOUND,
    //         error: 'Комментарий был не найден',
    //       },
    //       HttpStatus.NOT_FOUND,
    //     );
    //   }
    // }
    return await this.commentService.create(
      idNews,
      comment.message,
      JwtUserId,
      // idComment,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/api/:idComment')
  @ApiOperation({ summary: 'Удаление комментария' })
  @ApiResponse({
    status: 200,
    description: 'комментарий удален',
    type: CommentsEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав для удаления' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  async remove(
    @Param('idComment', ParseIntPipe) idComment: number,
    @Req() req,
  ): Promise<CommentsEntity> {
    const userId = req.user.id;
    return this.commentService.removeById(idComment, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Delete('/api/all/:idNews')
  @ApiOperation({ summary: 'Удаление всех комментариев новости' })
  @ApiResponse({
    status: 200,
    description: 'комментарии удалены',
    type: [CommentsEntity],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав для удаления' })
  removeAllByNewsId(
    @Param('idNews', ParseIntPipe) idNews: number,
  ): Promise<CommentsEntity[]> {
    return this.commentService.removeAllByNewsId(idNews);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/api/:idComment')
  @ApiOperation({ summary: 'Редактирование комментария' })
  @ApiResponse({
    status: 200,
    description: 'комментарий редактирован',
    type: CommentsEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Недостаточно прав для редактирования',
  })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  @ApiBody({ type: CommentDto })
  async edit(
    @Req() req,
    @Param('idComment', ParseIntPipe) idComment: number,
    @Body() { message }: CommentDto,
  ): Promise<CommentsEntity> {
    return await this.commentService.edit(idComment, message, req.user.id);
  }
}
