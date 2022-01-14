import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './users.entity';
import { hash } from '../utils/crypto';
import { EditUserDto } from './dtos/edit-user-dto';
import { checkPermission, Modules } from 'src/auth/role/unit/check-permission';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  ) {}

  async create(user) {
    const usersEntity = new UsersEntity();
    usersEntity.firstName = user.firstName;
    usersEntity.email = user.email;
    usersEntity.roles = user.roles;
    usersEntity.password = await hash(user.password);

    return this.usersRepository.save(usersEntity);
  }

  async findById(id: number) {
    return this.usersRepository.findOne(id);
  }

  async findByEmail(email): Promise<UsersEntity> {
    return await this.usersRepository.findOne({ email });
  }

  async edit(user: EditUserDto, id: number) {
    const _user = await this.findById(id);
    if (_user) {
      _user.firstName = user.firstName || _user.firstName;
      _user.email = user.email || _user.email;
      if (checkPermission(Modules.changeRole, _user.roles)) {
        _user.roles = user.roles || _user.roles;
      }
      _user.password = (await hash(user.password)) || _user.password;

      await this.usersRepository.save(_user);
      return true;
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
