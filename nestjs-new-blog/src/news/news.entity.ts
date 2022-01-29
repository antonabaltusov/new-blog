import { UsersEntity } from '../users/users.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CommentsEntity } from './comments/comments.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('news')
export class NewsEntity {
  @ApiProperty({
    example: 1,
    description: 'Идентификатор новости',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Новость про котов',
    description: 'Заголовок новости',
  })
  @Column('text')
  title: string;

  @ApiProperty({
    example: 'Коты милые и классные',
    description: 'Описание новости',
  })
  @Column('text')
  description: string;

  @ApiProperty({
    example: 'http://localhost:3000/news-static/c82af8b2-f359-4290-bd0c-af11684cee6e.jpeg',
    description: 'Обложка новости',
  })
  @Column('text', { nullable: true })
  cover: string;

  // @ManyToOne(() => CategoriesEntity, (category) => category.news)
  // category: CategoriesEntity;

  @ManyToOne(() => UsersEntity, (user) => user.news)
  user: UsersEntity;

  @OneToMany(() => CommentsEntity, (comments) => comments.news)
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
