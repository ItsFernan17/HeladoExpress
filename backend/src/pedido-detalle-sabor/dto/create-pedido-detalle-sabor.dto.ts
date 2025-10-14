import { IsInt, IsPositive, IsNotEmpty } from 'class-validator';

export class CreatePedidoDetalleSaborDto {
  @IsNotEmpty({ message: 'El ID del detalle de pedido es requerido' })
  @IsInt({ message: 'El ID del detalle de pedido debe ser un número entero' })
  @IsPositive({ message: 'El ID del detalle de pedido debe ser mayor a 0' })
  detalle_pedido_id: number;

  @IsNotEmpty({ message: 'El ID del sabor es requerido' })
  @IsInt({ message: 'El ID del sabor debe ser un número entero' })
  @IsPositive({ message: 'El ID del sabor debe ser mayor a 0' })
  sabor_id: number;
}
