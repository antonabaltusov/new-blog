import { Test, TestingModule } from '@nestjs/testing';
import { type } from 'os';
import { Role } from '../auth/role/role.enum';
import { Timestamp } from 'typeorm';
import { UsersController } from './users.controller';
import { UsersEntity } from './users.entity';
import { UsersService } from './users.service';
import { EditUserDto } from './dtos/edit-user-dto';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser = {
    id: 1,
    firstName: 'Dima',
    email: 'mail@mail.ru',
    password: 'dcfdvsdfv',
    roles: Role.User,
    avatar: 'img.png',
    createdAt: 2,
    updatedAt: 3,
  };

  const mockUsersService = {
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
      const result = {
        ...mockUser,
        avatar: dto.avatar || mockUser.avatar,
        email: dto.email || mockUser.email,
        password: dto.password || mockUser.password,
        firstName: dto.firstName || mockUser.firstName,
      };
      return result;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const dto = {
      firstName: 'Anton',
      email: 'examle@mail.ru',
      password: 'dcscsdc.',
      avatar: null,
    };
    expect(await controller.createUser(dto)).toEqual({
      id: expect.any(Number),
      ...dto,
      password: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('should edit a user', async () => {
    const dto = {
      firstName: 'Anton',
      avatar: null,
      email: null,
      password: null,
    };
    const req = { user: { id: 1 } };
    expect(await controller.edit(req, dto)).toEqual({
      ...mockUser,
      avatar: dto.avatar || mockUser.avatar,
      email: dto.email || mockUser.email,
      password: dto.password || mockUser.password,
      firstName: dto.firstName || mockUser.firstName,
    });
  });
});
