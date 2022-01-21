import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { Role } from '../../auth/role/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.roles)
  roles: Role;

  @ValidateIf((o) => o !== undefined)
  avatar: string;
}
