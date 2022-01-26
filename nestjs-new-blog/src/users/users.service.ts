import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './users.entity';
import { hash } from '../utils/crypto';
import { EditUserDto } from './dtos/edit-user-dto';
import { Role } from '../auth/role/role.enum';
import { CreateUserDto } from './dtos/create-user-dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  ) {}

  async createUser(user: CreateUserDto): Promise<UsersEntity> {
    if (!(await this.findByEmail(user.email))) {
      user.password = await hash(user.password);
      const newUser = this.usersRepository.create(user);
      newUser.roles = Role.User;
      await this.usersRepository.save(newUser);
      newUser.password = null;
      return newUser;
    }
    throw new HttpException(
      {
        status: HttpStatus.CONFLICT,
        error: 'Этот email уже был зарегистрирован',
      },
      HttpStatus.CONFLICT,
    );
  }

  async findById(id: number) {
    return this.usersRepository.findOne(id);
  }

  async findByEmail(email): Promise<UsersEntity> {
    const result = await this.usersRepository.find({
      where: { email: email },
    });
    return result[0];
  }

  async edit(user: EditUserDto, id: number): Promise<UsersEntity> {
    const _user = await this.findById(id);
    if (!_user) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Неверный идентификатор пользователя',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    _user.firstName = user.firstName || _user.firstName;
    _user.email = user.email || _user.email;
    _user.avatar = user.avatar || _user.avatar;
    _user.password = (await hash(user.password)) || _user.password;

    return await this.usersRepository.save(_user);
  }
}
