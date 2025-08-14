import { IsNotEmpty, IsNumber } from 'class-validator';
import { ICreatePedidoItemBola } from '../Interfaces/pedido-item-bola.interface';

export class CreatePedidoItemBolaDto implements ICreatePedidoItemBola {
  @IsNotEmpty({ message: 'El ID del pedido item es obligatorio' })
  @IsNumber({}, { message: 'El ID del pedido item debe ser un número válido' })
  pedido_item_id: number;

  @IsNotEmpty({ message: 'El ID del sabor es obligatorio' })
  @IsNumber({}, { message: 'El ID del sabor debe ser un número válido' })
  sabor_id: number;

  @IsNotEmpty({ message: 'El ID del usuario de ingreso es obligatorio' })
  @IsNumber({}, { message: 'El ID del usuario de ingreso debe ser un número' })
  usuario_ingreso: number;
}
