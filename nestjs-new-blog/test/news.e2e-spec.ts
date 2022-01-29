import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException, HttpStatus, INestApplication, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { NewsModule } from '../src/news/news.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NewsEntity } from '../src/news/news.entity';
import { Role } from '../src/auth/role/role.enum';
import { CommentsService } from '../src/news/comments/comments.service';
import { NewsService } from '../src/news/news.service';
import { MailService } from '../src/mail/mail.service';
import { UsersService } from '../src/users/users.service';
import { CommentsEntity } from '../src/news/comments/comments.entity';
import { UsersEntity } from '../src/users/users.entity';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { response } from 'express';
import { IsDateString, isDateString } from 'class-validator';

describe('NewsController (e2e)', () => {
  let app: INestApplication;
  const mockUsers = [
    {
      id: 1,
      firstName: 'Dima',
      email: 'mail@mail.ru',
      password: 'dcfdvsdfv',
      roles: Role.User,
      avatar: 'img.png',
      createdAt: 2,
      updatedAt: 3,
    },
    {
      id: 2,
      firstName: 'Dima',
      email: 'mail@mail.ru',
      password: 'dcfdvsdfv',
      roles: Role.User,
      avatar: 'img.png',
      createdAt: 2,
      updatedAt: 3,
    },
  ];

  const mockUsersService = {
    findById: jest.fn((idUser) => {
      return mockUsers.find((user) => user.id === idUser);
    }),
    createUser: jest.fn((dto) => {
      return {
        id: Date.now(),
        ...dto,
        password: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),
    edit: jest.fn((dto, req) => {
      const user = { ...mockUsers[0] };
      const result = {
        ...user,
        avatar: dto.avatar || user.avatar,
        email: dto.email || user.email,
        password: dto.password || user.password,
        firstName: dto.firstName || user.firstName,
      };
      return result;
    }),
  };

  const mockNews = [
    {
      id: 1,
      title: 'cat',
      description: 'mail@Коты милые и классные.ru',
      cover: 'img.jpeg',
      user: mockUsers[0],
      createdAt: 2,
      updatedAt: 3,
    },
    {
      id: 2,
      title: 'cat',
      description: 'mail@Коты милые и классные.ru',
      cover: 'img.jpeg',
      user: mockUsers[1],
      createdAt: 2,
      updatedAt: 3,
    },
  ];

  const mockNewsService = {
    findById: jest.fn((id) => {
      const _news = mockNews.find((news) => news.id === id);
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
    }),

    findByUserId: jest.fn((id) => {
      return mockNews.filter((news) => news.user.id === id);
    }),

    getAll: jest.fn(() => mockNews),

    create: jest.fn((news, idUser) => {
      const _user = mockUsers.find((user) => user.id === idUser);
      return {
        id: Date.now(),
        ...news,
        user: _user,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

    remove: jest.fn((id) => {
      return mockNews.find((news) => news.id === id);
    }),

    edit: jest.fn((newNews, id, idNew) => {
      const _news = mockNews.find((news) => news.id === id);
      if (!_news) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Новость не найдена',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      if (_news.user.id !== idNew) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Недостаточно прав для редактирования',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      const filtredNewNews = {};
      for (const key in newNews) {
        if (newNews[key] !== _news[key] && !!newNews[key]) {
          filtredNewNews[key] = true;
        }
      }
      _news.title = newNews.title || _news.title;
      _news.description = newNews.description || _news.description;
      _news.cover = newNews.cover || _news.cover;
      return {
        news: _news,
        filterNewNews: filtredNewNews,
      };
    }),
  };

  const mockMailService = {
    sendNewNewsForAdmins: jest.fn((): void => {}),
    editNewsForAdmins: jest.fn((): void => {}),
  };

  const mockComments = [
    {
      id: 1,
      message: 'message',
      user: mockUsers[0],
      news: mockNews[0],
      createdAt: 2,
      updatedAt: 3,
    },
    {
      id: 2,
      message: 'message',
      user: mockUsers[0],
      news: mockNews[0],
      createdAt: 2,
      updatedAt: 3,
    },
  ];
  const mockCommentsService = {
    save: jest.fn().mockImplementation((comment) =>
      Promise.resolve({
        id: Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...comment,
      }),
    ),

    findOne: jest.fn().mockImplementation((id, options?) => {
      const comment = mockComments.find((c) => c.id === id);
      return Promise.resolve(comment);
    }),

    find: jest.fn().mockResolvedValue(mockComments),

    remove: jest.fn().mockImplementation((dto) => {
      return Promise.resolve(dto);
    }),

    removeAllByNewsId: jest.fn((id) => {
      return mockComments.filter((comment) => comment.news.id === id);
    }),
  };

  const mockNewsRepository = {
    findOne: jest.fn().mockImplementation((id) => {
      const news = mockNews.find((news) => news.id === id);
      console.log(news);
      return Promise.resolve(news);
    }),

    find: jest.fn().mockImplementation((options?) => {
      let answer = [...mockNews];
      if (options.where?.user) {
        for (const key in options.where.user) {
          const _answer = answer.filter(
            (news) => news.user[key] === options.where.user[key],
          );
          answer = [..._answer];
        }
      }
      return Promise.resolve(answer);
    }),

    save: jest.fn().mockImplementation((news) =>
      Promise.resolve({
        id: Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...news,
      }),
    ),

    remove: jest.fn().mockImplementation((news) => Promise.resolve(news)),
  };

  const mockCommentsRepository = {};
  const mockUsersRepository = {};

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NewsModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 1 };
          return true;
        },
      })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(CommentsService)
      .useValue(mockCommentsService)
      .overrideProvider(NewsService)
      .useValue(mockNewsService)
      .overrideProvider(MailService)
      .useValue(mockMailService)
      .overrideProvider(getRepositoryToken(NewsEntity))
      .useValue(mockNewsRepository)
      .overrideProvider(getRepositoryToken(CommentsEntity))
      .useValue(mockCommentsRepository)
      .overrideProvider(getRepositoryToken(UsersEntity))
      .useValue(mockUsersRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/news/api/all (GET)', () => {
    return request(app.getHttpServer())
      .get('/news/api/all')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(mockNews);
  });

  it('/news/api/1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/news/api/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(mockNews[0]);
  });

  it('/news/api/4 (GET)--> 404', () => {
    return request(app.getHttpServer())
      .get('/news/api/4')
      .expect('Content-Type', /json/)
      .expect(404, { status: 404, error: 'Новость была не найдена' });
  });

  it('/news/api (POST)', () => {
    return request(app.getHttpServer())
      .post('/news/api')
      .send({ title: 'son', description: 'sonon', cover: null })
      .expect('Content-Type', /json/)
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual({
          id: expect.any(Number),
          title: 'son',
          description: 'sonon',
          cover: null,
          user: mockUsers[0],
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });
  });

  it('/news/api (POST)-->400 on valodation error', () => {
    return request(app.getHttpServer())
      .post('/news/api')
      .send({ title: 1, description: 'sonon', cover: null })
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('/news/api/1 (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/news/api/1')
      .send()
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(mockNews[0]);
  });

  it('/news/api/2 (DELETE)-->403 Недостаточно прав для удаления', () => {
    return request(app.getHttpServer())
      .delete('/news/api/2')
      .send()
      .expect(403);
  });

  it('/news/api/5 (DELETE)-->404 Новость не найдена', () => {
    return request(app.getHttpServer())
      .delete('/news/api/5')
      .send()
      .then((response) => {
        expect(response.body).toEqual({
          status: 404,
          error: 'Новость была не найдена',
        });
      });
  });

  it('/news/api (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/news/api/1')
      .send({ title: 'son', description: null, cover: null })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          ...mockNews[0],
          title: 'son',
        });
      });
  });

  it('/news/api/2 (PATCH)-->403 Недостаточно прав для удаления', () => {
    return request(app.getHttpServer())
      .patch('/news/api/2')
      .send({ title: 'son', description: null, cover: null })
      .expect(403);
  });

  it('/news/api/5 (PATCH)-->404 Новость не найдена', () => {
    return request(app.getHttpServer())
      .patch('/news/api/5')
      .send({ title: 'son', description: null, cover: null })
      .then((response) => {
        expect(response.body).toEqual({
          status: 404,
          error: 'Новость не найдена',
        });
      });
  });

  it('/news/api/1 (PATCH)-->400 on valodation error', () => {
    return request(app.getHttpServer())
      .patch('/news/api/1')
      .send({ title: 1, description: 'sonon', cover: null })
      .expect('Content-Type', /json/)
      .expect(400);
  });
});
