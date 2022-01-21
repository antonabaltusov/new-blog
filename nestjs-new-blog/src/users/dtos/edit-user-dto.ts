import { IsString, IsNotEmpty, ValidateIf, IsEmail } from 'class-validator';
import { Role } from 'src/auth/role/role.enum';

export class EditUserDto {
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.firstName)
  firstName: string;

  @IsEmail()
  @IsNotEmpty()
  @ValidateIf((o) => o.email)
  email: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.roles)
  roles: Role;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.password)
  password: string;

  @ValidateIf((o) => o !== undefined)
  avatar: string;
}
