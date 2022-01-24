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
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NewsService } from './news.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommentsService } from './comments/comments.service';
import { CreateNewsDto } from './dtos/create-news-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { HelperFileLoader } from 'src/utils/HelperFileLoader';
import { EditNewsDto } from './dtos/edit-news-dto';
import { extname } from 'path';
import { MailService } from 'src/mail/mail.service';
import { NewsEntity } from './news.entity';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { checkPermission, Modules } from 'src/auth/role/unit/check-permission';

const PATH_NEWS = '/news-static/';
HelperFileLoader.path = PATH_NEWS;

@ApiBearerAuth()
@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly commentsServise: CommentsService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  @Get('/all')
  @ApiOperation({
    summary:
      'Страница всех новостей, с возможностью фильтра по id пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Рендер списка новостей',
  })
  @ApiQuery({ name: 'idUser', type: Number, required: false })
  @Render('news/news-list')
  async getAllView(@Query('idUser') idUser: string) {
    if (idUser) {
      const idUserInt = parseInt(idUser);
      const _user = await this.usersService.findById(idUserInt);
      if (!_user) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Не существует такого автора',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const news = await this.newsService.findByUserId(idUserInt);
      if (news) {
        return { news, title: `Список новостей автора ${_user.firstName}` };
      }
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Новости были не найдены',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const news = await this.newsService.getAll();
    return { news, title: 'Список новостей' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('edit/news/:id')
  @ApiOperation({ summary: 'Страница редактирования новости' })
  @ApiResponse({
    status: 200,
    description: 'Рендер страницы редактирования новости',
  })
  @ApiResponse({
    status: 403,
    description: 'Недостаточно прав для редактирования.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Render('news/edit-news')
  async editView(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const news = await this.newsService.findById(id);
    if (news.user.id !== req.user.id) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Недостаточно прав для редактирования',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return { news, title: 'Редактирование новости' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('create/news')
  @ApiOperation({ summary: 'Страница создания новости' })
  @ApiResponse({
    status: 200,
    description: 'Рендер страницы создания новости',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Render('news/create-news')
  createView() {
    return { title: 'создание новости' };
  }

  @Get('/detail/:id')
  @ApiOperation({ summary: 'Детальная страница новости' })
  @ApiResponse({
    status: 200,
    description: 'Рендер детальной страницы новости',
  })
  @Render('news/detail-news')
  async detailView(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const news = await this.newsService.findById(id);
    if (!news) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Новость была не найдена',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return { news, title: news ? news.title : 'новость отсутствует' };
  }

  @Get('/api/all')
  @ApiOperation({ summary: 'получение списка новостей' })
  @ApiResponse({
    status: 200,
    description: 'Список новостей',
    type: [NewsEntity],
  })
  async getAll(): Promise<NewsEntity[]> {
    return this.newsService.getAll();
  }

  @Get('/api/:id')
  @ApiOperation({ summary: 'Получение новости' })
  @ApiResponse({
    status: 200,
    description: 'новость',
    type: NewsEntity,
  })
  @ApiResponse({ status: 404, description: 'Новость была не найдена.' })
  async get(@Param('id', ParseIntPipe) id: number): Promise<NewsEntity> {
    const _news = await this.newsService.findById(id);
    if (!_news) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Новость была не найдена',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return _news;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/api')
  @ApiOperation({ summary: 'Создание новости' })
  @ApiResponse({
    status: 200,
    description: 'Новость успешно создалась',
    type: NewsEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Не существует такого автора.' })
  @ApiResponse({ status: 400, description: 'Unsupported file type ...' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateNewsDto })
  @UseInterceptors(
    FileInterceptor('cover', {
      fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/i)) {
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
  async create(
    @Body() news: CreateNewsDto,
    @UploadedFile() cover: Express.Multer.File,
    @Req() req,
  ): Promise<NewsEntity> {
    if (cover?.filename) {
      news.cover = PATH_NEWS + cover.filename;
    }
    const _user = await this.usersService.findById(req.user.id);
    if (!_user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Не существует такого автора',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const createdNews = await this.newsService.create(news, req.user.id);
    await this.mailService.sendNewNewsForAdmins(
      ['sims0204@yandex.ru', 'sims0204@gmail.com'],
      createdNews,
    );
    return createdNews;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/api/:id')
  @ApiOperation({ summary: 'Удаление новости' })
  @ApiResponse({
    status: 200,
    description: 'новость удалена',
  })
  @ApiResponse({ status: 403, description: 'Недостаточно прав для удаления' })
  @ApiResponse({ status: 404, description: 'новость не найдена' })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const _user = await this.usersService.findById(req.user.id);
    const _news = await this.newsService.findById(id);

    if (
      _user.id !== _news.user.id &&
      !checkPermission(Modules.isAdmin, _user.roles)
    ) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Недостаточно прав для удаления',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    await this.commentsServise.removeAllByNewsId(id);
    return await this.newsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/api/:id')
  @ApiOperation({ summary: 'Редактирование новости' })
  @ApiResponse({
    status: 200,
    description: 'новость изменена',
  })
  @ApiResponse({
    status: 403,
    description: 'Недостаточно прав для редактирования',
  })
  @ApiResponse({ status: 404, description: 'новость не найдена' })
  @ApiResponse({ status: 400, description: 'Unsupported file type ...' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: EditNewsDto })
  @UseInterceptors(
    FileInterceptor('cover', {
      fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/i)) {
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
  async edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() news: EditNewsDto,
    @UploadedFile() cover: Express.Multer.File,
    @Req() req,
  ): Promise<NewsEntity> {
    if (cover?.filename) {
      news.cover = PATH_NEWS + cover.filename;
    }

    const answer = await this.newsService.edit(news, id, req.user.id);

    await this.mailService.editNewsForAdmins(
      ['sims0204@yandex.ru', 'sims0204@gmail.com'],
      answer.news,
      answer.filterNewNews,
    );
    return answer.news;
  }
}
