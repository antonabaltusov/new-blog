import { IsString, IsNotEmpty, ValidateIf, IsEmpty } from 'class-validator';

export class EditCommentDto {
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.message)
  message: string;
}
