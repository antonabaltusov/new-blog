import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import { Role } from 'src/auth/role/role.enum';
import { Roles } from 'src/auth/role/roles.decorator';
import { checkPermission, Modules } from 'src/auth/role/unit/check-permission';
import { HelperFileLoader } from 'src/utils/HelperFileLoader';
import { CreateUserDto } from './dtos/create-user-dto';
import { EditUserDto } from './dtos/edit-user-dto';
import { UsersService } from './users.service';

const PATH_NEWS = '/news-static/';
HelperFileLoader.path = PATH_NEWS;

@Controller('users')
export class UsersController {
  constructor(private readonly usersServise: UsersService) {}

  @Get('create')
  @Render('user/create-user')
  async renderLogin() {
    return { layout: 'auth', title: 'регистрация' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/edit/')
  @Render('user/edit-user')
  async editView(@Req() req) {
    const _user = await this.usersServise.findById(req.user.id);
    if (!checkPermission(Modules.isAdmin, _user.roles)) {
      _user.roles = null;
    }
    return { _user, title: 'Редактирование пользователя' };
  }

  @Post('api')
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
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    if (avatar?.filename) {
      user.avatar = PATH_NEWS + avatar.filename;
    }
    return await this.usersServise.createUser(user);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('/api/')
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
    @UploadedFile() avatar: Express.Multer.File,
  ): Promise<boolean> {
    if (avatar?.filename) {
      editUser.avatar = PATH_NEWS + avatar.filename;
    }
    return await this.usersServise.edit(editUser, req.user.id);
  }

  @Get('/api/')
  @UseGuards(JwtAuthGuard)
  async getUsersPermisions(@Req() req): Promise<any> {
    const JwtUserId = req.user.userId;
    const _user = await this.usersServise.findById(JwtUserId);
    return {
      roles: _user.roles,
      id: _user.id,
    };
  }
}
