import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteComplementoDto {
  @IsNotEmpty({ message: 'El ID del usuario que está eliminando es obligatorio' })
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  usuario_modifica: number;
}
