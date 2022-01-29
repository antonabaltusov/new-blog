import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, ValidateIf, IsEmail } from 'class-validator';

export class EditUserDto {
  @ApiProperty({
    example: 'Антон',
    description: 'Имя пользователя',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.firstName)
  firstName: string;

  @ApiProperty({
    example: 'example@example.com',
    description: 'Почта пользователя',
    required: false,
  })
  @IsEmail()
  @IsNotEmpty()
  @ValidateIf((o) => o.email)
  email: string;

  @ApiProperty({
    example: '2hk_H.Gk45-j',
    description: 'Пароль пользователя',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.password)
  password: string;

  @ApiProperty({
    type: 'file',
    description: 'Аватар пользователя',
    required: false,
  })
  @ValidateIf((o) => o !== undefined)
  avatar: string;
}
