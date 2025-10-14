import { IsNotEmpty, IsArray, IsInt, IsPositive, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePedidoItemDto {
  @IsNotEmpty({ message: 'El productoId es obligatorio' })
  @IsInt({ message: 'El productoId debe ser un número entero' })
  @IsPositive({ message: 'El productoId debe ser un número positivo' })
  productoId: number;

  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsPositive({ message: 'La cantidad debe ser un número positivo' })
  cantidad: number;

  @IsArray({ message: 'Los sabores deben ser un array' })
  @IsInt({ each: true, message: 'Cada sabor debe ser un número entero' })
  @IsPositive({ each: true, message: 'Cada sabor debe ser un número positivo' })
  sabores: number[];
}

export class CreatePedidoCompleteDto {
  @IsNotEmpty({ message: 'Los items son obligatorios' })
  @IsArray({ message: 'Los items deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un item' })
  @ValidateNested({ each: true })
  @Type(() => CreatePedidoItemDto)
  items: CreatePedidoItemDto[];
}
