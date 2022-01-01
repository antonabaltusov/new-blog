import { IsString, IsNotEmpty, ValidateIf, IsEmpty } from 'class-validator';

export class EditCommentDto {
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.message)
  message: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.author)
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
