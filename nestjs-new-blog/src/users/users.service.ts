import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './users.entity';
import { hash } from '../utils/crypto';
import { EditUserDto } from './dtos/edit-user-dto';

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

  async edit(editUser: EditUserDto, id: number) {
    const _editableUser = await this.findById(id);
    if (_editableUser) {
      _editableUser.firstName = editUser.firstName;
      _editableUser.email = editUser.email;
      await this.usersRepository.save(_editableUser);
      return true;
    }
    return false;
  }
}
