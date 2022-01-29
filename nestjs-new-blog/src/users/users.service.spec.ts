import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../auth/role/role.enum';
import { UsersEntity } from './users.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

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

  const mockUsersRepository = {
    create: jest.fn().mockImplementation((dto) => {
      return {
        id: Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...dto,
      };
    }),
    save: jest.fn().mockImplementation((user) =>
      Promise.resolve({
        id: Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...user,
      }),
    ),

    find: jest.fn().mockImplementation((options?) => {
      let answer = [...mockUsers];
      if (options.where) {
        let answer1 = [...answer];
        for (const key in options.where) {
          if (mockUsers[0].hasOwnProperty(key)) {
            const answer2 = answer1.map((user) => {
              if (user[key] === options.where[key]) {
                return user;
              }
            });
            answer1 = [...answer2];
          }
        }
        answer = [...answer1];
      }
      return Promise.resolve({ ...answer });
    }),

    findOne: jest.fn().mockImplementation((id) => {
      return Promise.resolve({
        ...mockUsers.find((user) => user.id === id),
      });
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UsersEntity),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('записать нового пользователя и вернуть его', async () => {
    const dto = {
      firstName: 'Anton',
      avatar: null,
      email: 'dccsdc@jdncjh.con',
      password: '2ddc8dc',
    };
    expect(await service.createUser(dto)).toEqual({
      id: expect.any(Number),
      ...dto,
      password: null,
      roles: expect.stringMatching('user'),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('найти пользователя по индификатору', async () => {
    expect(await service.findById(mockUsers[0].id)).toEqual(mockUsers[0]);
  });

  it('найти пользователя по email', async () => {
    expect(await service.findByEmail('mail@mail.ru')).toEqual(mockUsers[0]);
  });

  it('отредактировать пользователя', async () => {
    const dto = {
      firstName: 'Anton',
      avatar: null,
      email: null,
      password: null,
    };
    expect(await service.edit(dto, mockUsers[0].id)).toEqual({
      ...mockUsers[0],
      firstName: dto.firstName,
    });
  });
});
