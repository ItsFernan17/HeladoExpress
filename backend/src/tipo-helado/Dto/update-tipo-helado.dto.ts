import { IsOptional, IsString, IsNumber, IsBoolean, MaxLength, MinLength, Min, Max } from 'class-validator';
import { IUpdateTipoHelado } from '../Interfaces/tipo-helado.interface';

export class UpdateTipoHeladoDto implements IUpdateTipoHelado {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no debe exceder 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'La descripción no debe exceder 1000 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El máximo de bolas debe ser un número válido' })
  @Min(1, { message: 'El máximo de bolas debe ser al menos 1' })
  @Max(10, { message: 'El máximo de bolas no debe exceder 10' })
  max_bolas?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El precio base debe ser un número válido' })
  @Min(0, { message: 'El precio base no puede ser negativo' })
  precio_base?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El precio por bola adicional debe ser un número válido' })
  @Min(0, { message: 'El precio por bola adicional no puede ser negativo' })
  precio_bola_adicional?: number;

  @IsOptional()
  @IsBoolean({ message: 'El campo permite_complemento debe ser un valor booleano' })
  permite_complemento?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del usuario de modificación debe ser un número' })
  usuario_modifica?: number;
}
