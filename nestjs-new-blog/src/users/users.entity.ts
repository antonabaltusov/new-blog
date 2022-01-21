import { IsEnum } from 'class-validator';
import { CommentsEntity } from 'src/news/comments/comments.entity';
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
import { Exclude } from 'class-transformer';
//import { CommentsEntity } from '../news/comments/comments.entity';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  firstName: string;

  @Column('text')
  email: string;

  @Column('text')
  password: string;

  @Column('text')
  @IsEnum(Role)
  roles: Role;

  @Column('text', { nullable: true })
  avatar: string;

  @OneToMany(() => NewsEntity, (news) => news.user)
  news: NewsEntity[];

  @OneToMany(() => CommentsEntity, (comments) => comments.user)
  comments: CommentsEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
