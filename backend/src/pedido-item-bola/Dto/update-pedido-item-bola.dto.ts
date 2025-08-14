import { IsOptional, IsNumber } from 'class-validator';
import { IUpdatePedidoItemBola } from '../Interfaces/pedido-item-bola.interface';

export class UpdatePedidoItemBolaDto implements IUpdatePedidoItemBola {
  @IsOptional()
  @IsNumber({}, { message: 'El ID del pedido item debe ser un número válido' })
  pedido_item_id?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del sabor debe ser un número válido' })
  sabor_id?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del usuario de modificación debe ser un número' })
  usuario_modifica?: number;
}
