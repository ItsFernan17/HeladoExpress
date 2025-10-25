import { 
  IsNotEmpty, 
  IsString, 
  MaxLength, 
  MinLength, 
  Matches, 
  IsInt, 
  IsPositive, 
  IsNumber, 
  Min, 
  Max,
  IsOptional, 
  IsBoolean 
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductoDto {
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @Type(() => Number)
  @IsInt({ message: 'La categoría debe ser un número entero válido' })
  @IsPositive({ message: 'La categoría debe ser un número positivo' })
  categoria_id: number;

  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto válida' })
  @Transform(({ value }) => value?.trim())
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder los 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s0-9\-_.]+$/, { 
    message: 'El nombre solo puede contener letras, números, espacios, guiones, puntos y guiones bajos. No se permiten caracteres especiales como @, #, $, %, etc.' 
  })
  nombre: string;

  @IsNotEmpty({ message: 'El precio base es obligatorio' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio base debe ser un número con máximo 2 decimales' })
  @Min(0.01, { message: 'El precio base debe ser mayor a Q0.01' })
  @Max(9999.99, { message: 'El precio base no puede ser mayor a Q9,999.99' })
  precio_base: number;

  @IsOptional()
  @IsString({ message: 'La moneda debe ser una cadena de texto válida' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  @MaxLength(10, { message: 'La moneda no puede exceder los 10 caracteres' })
  @Matches(/^[A-Z]{1,5}$/, { message: 'La moneda debe contener solo letras mayúsculas (ej: GTQ, USD)' })
  moneda?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  esta_activo?: boolean;
}
