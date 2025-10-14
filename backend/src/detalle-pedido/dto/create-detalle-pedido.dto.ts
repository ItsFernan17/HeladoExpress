import { IsNotEmpty, IsInt, IsPositive, IsNumber, Min } from 'class-validator';

export class CreateDetallePedidoDto {
  @IsNotEmpty({ message: 'El pedido es obligatorio' })
  @IsInt({ message: 'El pedido debe ser un número entero' })
  @IsPositive({ message: 'El pedido debe ser un número positivo' })
  pedido_id: number;

  @IsNotEmpty({ message: 'El producto es obligatorio' })
  @IsInt({ message: 'El producto debe ser un número entero' })
  @IsPositive({ message: 'El producto debe ser un número positivo' })
  producto_id: number;

  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsPositive({ message: 'La cantidad debe ser un número positivo' })
  cantidad: number;

  @IsNotEmpty({ message: 'El precio unitario es obligatorio' })
  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @Min(0.01, { message: 'El precio unitario debe ser mayor a 0' })
  precio_unitario: number;

  @IsNotEmpty({ message: 'El subtotal es obligatorio' })
  @IsNumber({}, { message: 'El subtotal debe ser un número' })
  @Min(0.01, { message: 'El subtotal debe ser mayor a 0' })
  subtotal: number;
}
