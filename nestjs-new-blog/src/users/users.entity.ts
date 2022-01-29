import { IsEnum } from 'class-validator';
import { CommentsEntity } from '../news/comments/comments.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { NewsEntity } from '../news/news.entity';
import { Role } from '../auth/role/role.enum';
import { ApiProperty } from '@nestjs/swagger';
//import { CommentsEntity } from '../news/comments/comments.entity';

@Entity('users')
export class UsersEntity {
  @ApiProperty({
    example: 1,
    description: 'Идентификатор пользователя',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Антон',
    description: 'Имя пользователя',
  })
  @Column('text')
  firstName: string;

  @ApiProperty({
    example: 'example@example.com',
    description: 'Почта пользователя',
  })
  @Column('text')
  email: string;

  @Column('text')
  password: string;

  @ApiProperty({
    example: Role.User,
    description: 'Пароль пользователя',
  })
  @Column('text')
  @IsEnum(Role)
  roles: Role;

  @ApiProperty({
    example: 'http://localhost:3000/news-static/c82af8b2-f359-4290-bd0c-af11684cee6e.jpeg',
    description: 'Аватар пользователя',
  })
  @Column('text', { nullable: true })
  avatar: string;

  @OneToMany(() => NewsEntity, (news) => news.user)
  news: NewsEntity[];

  @OneToMany(() => CommentsEntity, (comments) => comments.user)
  comments: CommentsEntity[];

  @ApiProperty({
    example: '2022-01-12 11:22:32.314',
    description: 'дата и время создания',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2022-01-12 11:22:32.314',
    description: 'дата и время редактирования',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
