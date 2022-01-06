import { IsNumber, IsNotEmpty, IsString, ValidateIf, IsEmpty } from 'class-validator';

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

  @IsEmpty()
  countView: number;

  @ValidateIf((o) => o !== undefined)
  cover: string;
}
