import { IsEmpty, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { Comment } from '../comments.service';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  authorId: string;
}
