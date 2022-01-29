import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, ValidateIf } from 'class-validator';

export class CommentDto {
  @ApiProperty({
    example: 'Полностью согласен с автором!',
    description: 'текст комментария',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}
