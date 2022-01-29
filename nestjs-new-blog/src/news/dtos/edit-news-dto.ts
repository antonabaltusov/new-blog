import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, ValidateIf } from 'class-validator';

export class EditNewsDto {
  @ApiProperty({
    example: 'Новость про котов',
    description: 'Заголовок новости',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.title)
  title: string;

  @ApiProperty({
    example: 'Коты милые и классные',
    description: 'Описание новости',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.description)
  description: string;

  @ApiProperty({
    type: 'file',
    description: 'Обложка новости',
    required: false,
  })
  @ValidateIf((o) => o.cover)
  cover: string;
}
