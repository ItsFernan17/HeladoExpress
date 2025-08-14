import { IsNotEmpty, IsOptional, IsString, IsNumber, MaxLength, MinLength } from 'class-validator';
import { IUpdateSabor } from '../Interfaces/sabor.interface';

export class UpdateSaborDto implements IUpdateSabor {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsOptional()
  @MinLength(4, { message: 'El nombre del sabor debe tener al menos 4 caracteres' })
  @MaxLength(50, { message: 'El nombre del sabor no debe exceder 50 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del usuario de modificación debe ser un número' })
  usuario_modifica?: number;
}
