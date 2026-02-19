import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Username é obrigatório' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Password é obrigatório' })
  password: string;
}
