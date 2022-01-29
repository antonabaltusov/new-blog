import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../../auth/role/role.enum';
import { UsersService } from '../../users/users.service';
import { CommentsController } from './comments.controller';
import { CommentsEntity } from './comments.entity';
import { CommentsService } from './comments.service';

describe('CommentsController', () => {
  let controller: CommentsController;

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

  const mockComments = [
    {
      id: 1,
      message: 'message',
      user: mockUsers[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockCommentsService = {
    findByNewsId: jest.fn((idNews) => {
      return mockComments;
    }),

    create: jest.fn((idNews, message, idUser) => {
      return {
        id: Date.now(),
        message: message,
        user: mockUsers[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

    edit: jest.fn((idComment, message, idUser) => {
      return {
        ...mockComments.find((comment) => comment.id === idComment),
        message: message,
      };
    }),

    removeById: jest.fn((idComment, idUser) => {
      return {
        ...mockComments.find((comment) => comment.id === idComment),
      };
    }),
    removeAllByNewsId: jest.fn((idUser) => {
      return mockComments;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [UsersService, CommentsService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(CommentsService)
      .useValue(mockCommentsService)
      .compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('возвращает все комментарии по id новости', async () => {
    expect(await controller.getAll(1)).toEqual([
      {
        id: expect.any(Number),
        message: expect.any(String),
        user: mockUsers[0],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    ]);
  });

  it('создает комментарий и возвращает его', async () => {
    expect(
      await controller.create(1, { message: 'норм' }, { user: { id: 1 } }),
    ).toEqual({
      id: expect.any(Number),
      message: 'норм',
      user: mockUsers[0],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('редактирует комментарий и возвращает его', async () => {
    expect(
      await controller.edit({ user: { id: 1 } }, 1, { message: 'норм!!' }),
    ).toEqual({
      id: expect.any(Number),
      message: 'норм!!',
      user: mockUsers[0],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('удаляет комментарий и возвращает его', async () => {
    expect(await controller.remove(1, { user: { id: 1 } })).toEqual({
      id: expect.any(Number),
      message: expect.any(String),
      user: mockUsers[0],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('удаляет все комментарии по id новости их в массиве', async () => {
    expect(await controller.removeAllByNewsId(1)).toEqual(mockComments);
  });
});
