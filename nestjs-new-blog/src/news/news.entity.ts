import { UsersEntity } from 'src/users/users.entity';
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
// import { CategoriesEntity } from '../categories/categories.entity';

@Entity('news')
export class NewsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  title: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  cover: string;

  // @ManyToOne(() => CategoriesEntity, (category) => category.news)
  // category: CategoriesEntity;

  @ManyToOne(() => UsersEntity, (user) => user.news)
  user: UsersEntity;
  
  @OneToMany(() => CommentsEntity, (comments) => comments.news)
  comments: CommentsEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
