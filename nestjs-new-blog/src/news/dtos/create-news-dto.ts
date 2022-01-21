import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateNewsDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  userId: string;

  @ValidateIf((o) => o !== undefined)
  cover: string;
}
