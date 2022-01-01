import { IsNumber, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateNewsDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  author: string;

  @IsNumber()
  @IsNotEmpty()
  @ValidateIf((o) => o.countView || o.countView === '')
  countView: number;

  @ValidateIf((o) => o !== undefined)
  cover: string;
}
