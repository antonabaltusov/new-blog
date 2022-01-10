import { IsString, IsNotEmpty, ValidateIf } from 'class-validator';

export class EditNewsDto {  
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.title)
  title: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.description)
  description: string;

  @ValidateIf((o) => o.cover)
  cover: string;
}
