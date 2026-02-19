import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class GenerateCodeDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsDateString({}, { message: 'Data de expiração inválida' })
  @IsNotEmpty({ message: 'Tempo é obrigatório' })
  tempo: string;
}
