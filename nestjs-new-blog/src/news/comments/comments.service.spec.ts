import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../../auth/role/role.enum';
import { UsersService } from '../../users/users.service';
import { NewsService } from '../news.service';
import { CommentsEntity } from './comments.entity';
import { CommentsService } from './comments.service';

describe('CommentsService', () => {
  let service: CommentsService;

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
  ];

  const mockUsersService = {
    findById: jest.fn((idUser) => {
      return {
        ...mockUsers.find((user) => user.id === idUser),
      };
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
  };

  const mockEventEmitter2 = {
    emit: jest.fn((): void => {}),
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
  const mockCommentsRepository = {
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(CommentsEntity),
          useValue: mockCommentsRepository,
        },
        UsersService,
        NewsService,
        EventEmitter2,
      ],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(NewsService)
      .useValue(mockNewsService)
      .overrideProvider(EventEmitter2)
      .useValue(mockEventEmitter2)
      .compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('создает комментарий и возвращает его', async () => {
    expect(await service.create(1, 'норм', 1)).toEqual({
      id: expect.any(Number),
      message: 'норм',
      user: mockUsers[0],
      news: mockNews[0],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('поиск комментария по id', async () => {
    expect(await service.findById(mockComments[0].id)).toEqual(mockComments[0]);
  });

  it('поиск комментария по id новости', async () => {
    expect(await service.findByNewsId(1)).toEqual(mockComments);
  });

  it('удаление комментария по id и вернуть его', async () => {
    expect(await service.removeById(mockComments[0].id, 1)).toEqual(
      mockComments[0],
    );
  });

  it('удаление комментария по id новости и вернуть их в массиве', async () => {
    expect(await service.removeAllByNewsId(1)).toEqual(mockComments);
  });

  it('редактирование комментария по id новости и вернуть их в массиве', async () => {
    expect(await service.edit(1, 'изменение', 1)).toEqual({
      ...mockComments[0],
      message: 'изменение',
    });
  });
});
