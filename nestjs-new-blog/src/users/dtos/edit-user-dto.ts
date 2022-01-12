import { IsString, IsNotEmpty, ValidateIf, IsEmpty } from 'class-validator';

export class EditUserDto {
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.message)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.message)
  email: string;
}
