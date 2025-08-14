import { IsNotEmpty, IsOptional, IsString, IsNumber, MaxLength, MinLength } from 'class-validator';
import { IUpdateComplemento } from '../Interfaces/complemento.interface';

export class UpdateComplementoDto implements IUpdateComplemento {
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsOptional()
    @MinLength(4, { message: 'El nombre del complemento debe tener al menos 4 caracteres' })
    @MaxLength(50, { message: 'El nombre del complemento no debe exceder 50 caracteres' })
    nombre?: string;
    
    @IsOptional()
    precio?: number;
    
      @IsOptional()
  @IsNumber({}, { message: 'El ID del usuario de modificación debe ser un número' })
  usuario_modifica?: number;
}