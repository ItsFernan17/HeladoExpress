import { 
  IsNotEmpty, 
  IsString, 
  MaxLength, 
  MinLength, 
  Matches, 
  IsOptional, 
  IsBoolean
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoriaDto {
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto válida' })
  @Transform(({ value }) => value?.trim())
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(45, { message: 'El nombre no puede exceder los 45 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]+$/, { 
    message: 'El nombre solo puede contener letras, números, espacios, guiones y puntos. No se permiten caracteres especiales como @, #, $, %, etc.' 
  })
  nombre: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  esta_activo?: boolean;
}
