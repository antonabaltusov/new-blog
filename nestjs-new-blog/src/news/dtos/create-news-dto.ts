import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateNewsDto {
  @ApiProperty({
    example: 'Новость про котов',
    description: 'Заголовок новости',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Коты милые и классные',
    description: 'Описание новости',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    type: 'file',
    description: 'Обложка новости',
    required: false,
  })
  @ValidateIf((o) => o !== undefined)
  cover: string;
}
