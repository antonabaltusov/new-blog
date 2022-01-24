import {
  Controller,
  Post,
  UseGuards,
  Request,
  Res,
  Get,
  Render,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  @ApiOperation({ summary: 'Страница авторизации' })
  @ApiResponse({
    status: 200,
    description: 'Рендер страницы авторизации',
  })
  @Render('auth/login')
  async renderLogin() {
    return { layout: 'auth', title: 'Авторизация' };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Аутентификация пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Аутентификация прошла успешко',
    type: 'string',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Request() req, @Res({ passthrough: true }) response: Response) {
    console.log('login');
    const { access_token, id, role } = await this.authService.login(req.user);
    response.cookie('jwt', access_token, { httpOnly: true });
    response.cookie('userId', id);
    response.cookie('userRole', role);
    return access_token;
  }

}
