import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsersEntity } from '../../users/users.entity';
import { NewsEntity } from '../news.entity';

@Entity('comments')
export class CommentsEntity {
  @ApiProperty({
    example: 1,
    description: 'Идентификатор комментария',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Полностью согласен с автором!',
    description: 'текст комментария',
  })
  @Column('text')
  message: string;

  // @ApiProperty({
  //   example:
  //     '{firstName: anton, mail: anton@example.com, role: user, id: 1, avatar: http://localhost:3000/news-static/c82af8b2-f359-4290-bd0c-af11684cee6e.jpeg}',
  //   description: 'обьект автора новости',
  // })
  @ManyToOne(() => UsersEntity, (user) => user.comments)
  user: UsersEntity;

  @ManyToOne(() => NewsEntity, (news) => news.comments)
  news: NewsEntity;

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
