import { IsInt, IsPositive, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDetallePedidoItemDto {
  @IsNotEmpty({ message: 'El producto es obligatorio' })
  @IsInt({ message: 'El producto debe ser un número entero' })
  @IsPositive({ message: 'El producto debe ser un número positivo' })
  producto_id: number;

  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsPositive({ message: 'La cantidad debe ser un número positivo' })
  cantidad: number;
}

export class CreatePedidoDto {
  @IsInt({ message: 'El estado debe ser un número entero' })
  @IsPositive({ message: 'El estado debe ser un número positivo' })
  estado_id: number;

  @IsNotEmpty({ message: 'Los detalles del pedido son obligatorios' })
  @ValidateNested({ each: true })
  @Type(() => CreateDetallePedidoItemDto)
  detalles: CreateDetallePedidoItemDto[];
}
