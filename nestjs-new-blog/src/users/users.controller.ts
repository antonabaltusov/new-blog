import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Render,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { checkPermission, Modules } from '../auth/role/unit/check-permission';
import { HelperFileLoader } from '../utils/HelperFileLoader';
import { CreateUserDto } from './dtos/create-user-dto';
import { EditUserDto } from './dtos/edit-user-dto';
import { UsersEntity } from './users.entity';
import { UsersService } from './users.service';

const PATH_NEWS = '/news-static/';
HelperFileLoader.path = PATH_NEWS;

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersServise: UsersService) {}

  @Get('create')
  @ApiOperation({ summary: 'Страница регистрации' })
  @ApiResponse({
    status: 200,
    description: 'Рендер страницы регистрации',
  })
  @Render('user/create-user')
  async renderCreateUser() {
    return { layout: 'auth', title: 'регистрация' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('edit')
  @ApiOperation({ summary: 'Страница редактирования пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Рендер страницы редактирования пользователя',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Render('user/edit-user')
  async editView(@Req() req) {
    const _user = await this.usersServise.findById(req.user.id);
    if (!checkPermission(Modules.isAdmin, _user.roles)) {
      _user.roles = null;
    }
    return { _user, title: 'Редактирование пользователя' };
  }

  @Post('api')
  @ApiOperation({ summary: 'Создание пользователя' })
  @ApiResponse({
    status: 200,
    description: 'пользователь успешно создан',
    type: UsersEntity,
  })
  @ApiResponse({ status: 400, description: 'Unsupported file type ...' })
  @ApiResponse({
    status: 409,
    description: 'Этот email уже был зарегистрирован',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateUserDto })
  @UseInterceptors(
    FileInterceptor('avatar', {
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
  async createUser(
    @Body() user: CreateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ): Promise<UsersEntity> {
    if (avatar?.filename) {
      user.avatar = PATH_NEWS + avatar.filename;
    }
    return await this.usersServise.createUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/api/')
  @ApiOperation({ summary: 'Редактирование пользователя' })
  @ApiResponse({
    status: 200,
    description: 'пользователь успешно редактирован',
    type: UsersEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Unsupported file type ...' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: EditUserDto })
  @UseInterceptors(
    FileInterceptor('avatar', {
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
    @Req() req,
    @Body() editUser: EditUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ): Promise<UsersEntity> {
    if (avatar?.filename) {
      editUser.avatar = PATH_NEWS + avatar.filename;
    }
    return await this.usersServise.edit(editUser, req.user.id);
  }
}
