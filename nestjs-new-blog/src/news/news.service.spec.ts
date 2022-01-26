import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../auth/role/role.enum';
import { UsersService } from '../users/users.service';
import { NewsEntity } from './news.entity';
import { NewsService } from './news.service';

describe('NewsService', () => {
  let service: NewsService;

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
      description: 'Коты милые и классные.ru',
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

  const mockNewsRepository = {
    findOne: jest.fn().mockImplementation((id) => {
      return Promise.resolve({
        ...mockNews.find((news) => news.id === id),
      });
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

  const mockEventEmitter2 = {
    emit: jest.fn((): void => {}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        UsersService,
        EventEmitter2,
        {
          provide: getRepositoryToken(NewsEntity),
          useValue: mockNewsRepository,
        },
      ],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(EventEmitter2)
      .useValue(mockEventEmitter2)
      .compile();

    service = module.get<NewsService>(NewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('создание новости и возврат записи', async () => {
    const news = {
      title: 'lol',
      description: 'lolol',
      cover: 'imn.jpg',
    };
    expect(await service.create(news, 1)).toEqual({
      id: expect.any(Number),
      user: mockUsers[0],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      ...news,
    });
  });

  it('редактрование новости и возврат записи', async () => {
    const news = {
      title: 'change',
      description: null,
      cover: null,
    };
    expect(await service.edit(news, 1, 1)).toEqual({
      news: { ...mockNews[0], title: 'change' },
      filterNewNews: { title: true },
    });
  });

  it('вернуть обьект с отметкой true если изменилось значение свойсвтва', async () => {
    const news = {
      title: 'change',
      description: null,
      cover: null,
    };
    expect(await service.filter(mockNews[0], news)).toEqual({
      title: true,
    });
  });

  it('вернуть массив всех новостей', async () => {
    expect(await service.getAll()).toEqual(mockNews);
  });

  it('вернуть массив всех новостей пользователя', async () => {
    expect(await service.findByUserId(1)).toEqual([mockNews[0]]);
  });

  it('вернуть новость по id', async () => {
    expect(await service.findById(1)).toEqual(mockNews[0]);
  });

  it('удалить и вернуть новость по id', async () => {
    expect(await service.remove(1)).toEqual(mockNews[0]);
  });
});
