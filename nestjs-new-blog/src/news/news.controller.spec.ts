import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../auth/role/role.enum';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { CommentsService } from './comments/comments.service';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

describe('NewsController', () => {
  let controller: NewsController;

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
      id: 1,
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
      return {
        ...mockNews.find((news) => news.id === id),
      };
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [NewsService, CommentsService, MailService, UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(CommentsService)
      .useValue(mockCommentsService)
      .overrideProvider(NewsService)
      .useValue(mockNewsService)
      .overrideProvider(MailService)
      .useValue(mockMailService)
      .compile();

    controller = module.get<NewsController>(NewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('возвращает обьект для рендера списка новостей с фильтрацией по id автора', async () => {
    expect(await controller.getAllView(`${mockUsers[0].id}`)).toEqual({
      _news: [mockNews[0]],
      title: `Список новостей автора ${mockUsers[0].firstName}`,
    });
  });

  it('возвращает обьект для рендера списка новостей без фильтрацией по id автора', async () => {
    expect(await controller.getAllView()).toEqual({
      _news: mockNews,
      title: expect.any(String),
    });
  });

  it('возвращает обьект для рендера страницы редактирования новости', async () => {
    expect(await controller.editView(1, { user: { id: 1 } })).toEqual({
      _news: mockNews[0],
      title: expect.any(String),
    });
  });

  it('возвращает обьект для рендера детальной страницы новости', async () => {
    expect(await controller.detailView(1, { user: { id: 1 } })).toEqual({
      _news: mockNews[0],
      title: mockNews[0].title,
    });
  });

  it('возвращает обьект для рендера отсутствия новости', async () => {
    expect(await controller.detailView(3, { user: { id: 1 } })).toEqual({
      _news: expect.any(Object),
      title: 'новость отсутствует',
    });
  });

  it('возвращает массив всех новостей', async () => {
    expect(await controller.getAll()).toEqual(mockNews);
  });

  it('Получение новости', async () => {
    expect(await controller.get(1)).toEqual(mockNews[0]);
  });

  it('Создание записи в БД новости и возврат ее', async () => {
    const news = {
      title: 'lol',
      description: 'lolol',
      cover: 'imn.jpg',
    };
    expect(await controller.create(news, { user: { id: 1 } })).toEqual({
      ...news,
      id: expect.any(Number),
      user: mockUsers[0],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('удаление записи в БД новости и возврат ее', async () => {
    expect(await controller.remove(1, { user: { id: 1 } })).toEqual(
      mockNews[0],
    );
  });

  it('редактирвание записи в БД новости и возврат ее', async () => {
    const editNews = {
      title: 'change',
      description: null,
      cover: null,
    };
    expect(await controller.edit(1, editNews, { user: { id: 1 } })).toEqual({
      ...mockNews[0],
      title: 'change',
    });
  });
});
