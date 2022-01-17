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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role/role.enum';
import { Roles } from 'src/auth/role/roles.decorator';
import { checkPermission, Modules } from 'src/auth/role/unit/check-permission';
import { CreateUserDto } from './dtos/create-user-dto';
import { EditUserDto } from './dtos/edit-user-dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersServise: UsersService) {}

  @Get('/edit/:id')
  @Render('edit-user')
  async editView(@Param('id', ParseIntPipe) id: number) {
    const _user = await this.usersServise.findById(id);
    if (!_user) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Неверный идентификатор пользователя',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    if (!checkPermission(Modules.isAdmin, _user.roles)) {
      _user.roles = null;
    }
    return { _user, title: 'Редактирование пользователя' };
  }

  @Get('login')
  @Render('login-user')
  login() {
    return { title: 'вход' };
  }

  @Post('api')
  async create(@Body() user: CreateUserDto) {
    return this.usersServise.create(user);
  }

  @Patch('/api/')
  @UseInterceptors(FileInterceptor('user'))
  @UseGuards(JwtAuthGuard)
  async edit(@Req() req, @Body() editUser: EditUserDto): Promise<boolean> {
    const JwtUserId = req.user.userId;
    return await this.usersServise.edit(editUser, JwtUserId);
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
