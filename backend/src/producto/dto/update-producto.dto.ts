import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MaxLength, MinLength, Matches, IsBoolean, IsInt, IsPositive, IsNumber, Min } from 'class-validator';
import { CreateProductoDto } from './create-producto.dto';

export class UpdateProductoDto extends PartialType(CreateProductoDto) {
  @IsOptional()
  @IsInt({ message: 'La categoria debe ser un número entero' })
  @IsPositive({ message: 'La categoria debe ser un número positivo' })
  categoria_id?: number;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s0-9\-_.]+$/, { 
    message: 'El nombre solo puede contener letras, números, espacios, guiones y puntos' 
  })
  nombre?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El precio base debe ser un número' })
  @Min(0.01, { message: 'El precio base debe ser mayor a 0' })
  precio_base?: number;

  @IsOptional()
  @IsString({ message: 'La moneda debe ser una cadena de texto' })
  @MaxLength(10, { message: 'La moneda no puede tener más de 10 caracteres' })
  moneda?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  esta_activo?: boolean;
}
