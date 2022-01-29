import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from './role/role.enum';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn((user) => {
      return {
        access_token: `${Date.now()}`,
        id: user.id,
        role: user.roles,
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('возвращает обьект для рендера станицы авторизации', async () => {
    expect(await controller.renderLogin()).toEqual({
      layout: 'auth',
      title: 'Авторизация',
    });
  });

  it('редактирует комментарий и возвращает его', async () => {
    const res = {
      cookies: {},
      cookie: (name: string, data) => {
        res.cookies[name] = data;
      },
    };
    const user = {
      id: 1,
      firstName: 'Dima',
      email: 'mail@mail.ru',
      password: 'dcfdvsdfv',
      roles: Role.User,
      avatar: 'img.png',
      createdAt: 2,
      updatedAt: 3,
    };
    expect(await controller.login({ user }, res)).toEqual(expect.any(String));
  });
});
