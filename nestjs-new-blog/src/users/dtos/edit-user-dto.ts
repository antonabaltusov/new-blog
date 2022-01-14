import { IsString, IsNotEmpty, ValidateIf, IsEmpty } from 'class-validator';
import { Role } from 'src/auth/role/role.enum';

export class EditUserDto {
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.message)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.message)
  email: string;  
  
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.message)
  roles: Role;  

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.message)
  password: string;
}
