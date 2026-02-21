import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateCodeDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Tempo é obrigatório' })
  tempo: number;
}
