import { IsString, IsNumber, IsNotEmpty, ValidateIf } from 'class-validator';

export class EditNewsDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.title)
  title: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.description)
  description: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.author)
  author: string;

  @IsNumber()
  @IsNotEmpty()
  @ValidateIf((o) => o.countView || o.countView === '')
  countView: number;

  @ValidateIf((o) => o.cover)
  cover: string;
}
