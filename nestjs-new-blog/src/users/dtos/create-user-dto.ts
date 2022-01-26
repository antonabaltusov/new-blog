import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Антон',
    description: 'Имя пользователя',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'example@example.com',
    description: 'Почта пользователя',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '2hk_H.Gk45-j',
    description: 'Пароль пользователя',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    type: 'file',
    description: 'Аватар пользователя',
    required: false,
  })
  
  avatar: string;
}
