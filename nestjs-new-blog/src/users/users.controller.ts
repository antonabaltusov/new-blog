import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Render,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role/role.enum';
import { Roles } from 'src/auth/role/roles.decorator';
import { CreateUserDto } from './dtos/create-user-dto';
import { EditUserDto } from './dtos/edit-user-dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersServise: UsersService) {}

  @Get('/edit/:id')
  @Render('edit-user')
  async editView(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersServise.findById(id);
    return { user, title: 'Редактирование пользователя' };
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
  
  @Patch('/api/:id')
  @UseInterceptors(FileInterceptor('user'))
  @UseGuards(JwtAuthGuard)
  @Roles(Role.User)
  async edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() editUser: EditUserDto,
  ): Promise<boolean> {
    return await this.usersServise.edit(editUser, id);
  }
}
