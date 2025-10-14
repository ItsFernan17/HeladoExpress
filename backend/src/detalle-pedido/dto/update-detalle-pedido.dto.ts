import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsInt, IsPositive, IsNumber, Min } from 'class-validator';
import { CreateDetallePedidoDto } from './create-detalle-pedido.dto';

export class UpdateDetallePedidoDto extends PartialType(CreateDetallePedidoDto) {
  @IsOptional()
  @IsInt({ message: 'El pedido debe ser un número entero' })
  @IsPositive({ message: 'El pedido debe ser un número positivo' })
  pedido_id?: number;

  @IsOptional()
  @IsInt({ message: 'El producto debe ser un número entero' })
  @IsPositive({ message: 'El producto debe ser un número positivo' })
  producto_id?: number;

  @IsOptional()
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsPositive({ message: 'La cantidad debe ser un número positivo' })
  cantidad?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @Min(0.01, { message: 'El precio unitario debe ser mayor a 0' })
  precio_unitario?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El subtotal debe ser un número' })
  @Min(0.01, { message: 'El subtotal debe ser mayor a 0' })
  subtotal?: number;
}
