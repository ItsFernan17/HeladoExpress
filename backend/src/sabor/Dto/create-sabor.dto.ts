import { IsNotEmpty, IsString, IsNumber, MaxLength, MinLength } from 'class-validator';
import { ICreateSabor } from '../Interfaces/sabor.interface';

export class CreateSaborDto implements ICreateSabor {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MinLength(4, { message: 'El nombre del sabor debe tener al menos 4 caracteres' })
  @MaxLength(50, { message: 'El nombre del sabor no debe exceder 50 caracteres' })
  nombre: string;

  @IsNotEmpty({ message: 'El ID del usuario de ingreso es obligatorio' })
  @IsNumber({}, { message: 'El ID del usuario de ingreso debe ser un número' })
  usuario_ingreso: number;
}
