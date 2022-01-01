import { IsEmpty, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { Comment } from '../comments.service';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  author: string;

  @ValidateIf((o) => o.avatar)
  avatar: string;

  @IsEmpty()
  id: number;

  @IsEmpty()
  reply: Comment[];

  @IsEmpty()
  blockcomment: boolean;
}
