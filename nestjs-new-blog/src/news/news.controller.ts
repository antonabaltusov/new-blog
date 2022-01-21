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
  SerializeOptions,
} from '@nestjs/common';
import { NewsService } from './news.service';
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
import { Roles } from 'src/auth/role/roles.decorator';
import { Role } from 'src/auth/role/role.enum';
import { Request } from 'express';
import { JwtCookie } from 'src/auth/jwt.decorator';
import { WsJwtGuard } from 'src/auth/ws-jwt.guard';

const PATH_NEWS = '/news-static/';
HelperFileLoader.path = PATH_NEWS;

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly commentsServise: CommentsService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  @Get('/all')
  @Render('news/news-list')
  async getAllView(@Query('idUser') idUser: string) {
    if (idUser) {
      const _user = await this.usersService.findById(parseInt(idUser));
      if (!_user) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Не существует такого автора',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      const idUserInt = parseInt(idUser);
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
  @Render('news/edit-news')
  async editView(@Param('id', ParseIntPipe) id: number, @Req() req) {
    if (!id === req.user.id) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Недостаточно прав для удаления',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const news = await this.newsService.findById(id);
    return { news, title: 'Редактирование новости' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('create/news')
  @Render('news/create-news')
  createView() {
    return { title: 'создание новости' };
  }

  @Get('/detail/:id')
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
  async getAll(): Promise<NewsEntity[]> {
    return this.newsService.getAll();
  }

  @Get('/api/:id')
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
    //const comments = this.commentsServise.find(idInt);
    // if (comments && news) {
    //   return {
    //     ...news,
    //     comments,
    //   };
    // }
    //return 'новость не найдена';
  }

  @UseGuards(JwtAuthGuard)
  @Post('/api')
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
    news.userId = req.user.id;
    const createdNews = await this.newsService.create(news);
    // await this.mailService.sendNewNewsForAdmins(
    //   ['sims0204@yandex.ru', 'sims0204@gmail.com'],
    //   createdNews,
    // );
    return createdNews;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/api/:id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return await this.newsService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/api/:id')
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
  ): Promise<string> {
    if (!id === req.user.id) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Недостаточно прав для удаления',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (cover?.filename) {
      news.cover = PATH_NEWS + cover.filename;
    }

    const answer = await this.newsService.edit(news, id);

    if (answer.change) {
      await this.mailService.editNewsForAdmins(
        ['sims0204@yandex.ru', 'sims0204@gmail.com'],
        answer.news,
        answer.filterNewNews,
      );
      return 'Новость изменена';
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Новость была не найдена',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
