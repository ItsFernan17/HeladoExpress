import { IsNotEmpty, IsString, MaxLength, MinLength, Matches, IsInt, IsPositive, IsNumber, Min } from 'class-validator';

export class CreateProductoDto {
  @IsNotEmpty({ message: 'La categoria es obligatoria' })
  @IsInt({ message: 'La categoria debe ser un número entero' })
  @IsPositive({ message: 'La categoria debe ser un número positivo' })
  categoria_id: number;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s0-9\-_.]+$/, { 
    message: 'El nombre solo puede contener letras, números, espacios, guiones y puntos' 
  })
  nombre: string;

  @IsNotEmpty({ message: 'El precio base es obligatorio' })
  @IsNumber({}, { message: 'El precio base debe ser un número' })
  @Min(0.01, { message: 'El precio base debe ser mayor a 0' })
  precio_base: number;
}
