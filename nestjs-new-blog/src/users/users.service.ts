import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './users.entity';
import { hash } from '../utils/crypto';
import { EditUserDto } from './dtos/edit-user-dto';
import { checkPermission, Modules } from 'src/auth/role/unit/check-permission';
import { Role } from 'src/auth/role/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  ) {}

  async createUser(user): Promise<UsersEntity> {
    if (!(await this.findByEmail(user.email))) {
      const usersEntity = new UsersEntity();
      usersEntity.firstName = user.firstName;
      usersEntity.email = user.email;
      usersEntity.avatar = user.avatar;
      usersEntity.roles = Role.User;
      usersEntity.password = await hash(user.password);
      return await this.usersRepository.save(usersEntity);
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
    return await this.usersRepository.findOne({ email });
  }

  async edit(user: EditUserDto, id: number): Promise<UsersEntity> {
    const _user = await this.findById(id);
    if (_user) {
      _user.firstName = user.firstName || _user.firstName;
      _user.email = user.email || _user.email;
      _user.avatar = user.avatar || _user.avatar;
      _user.password = (await hash(user.password)) || _user.password;

      await this.usersRepository.save(_user);
    }
    throw new HttpException(
      {
        status: HttpStatus.FORBIDDEN,
        error: 'Неверный идентификатор пользователя',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
