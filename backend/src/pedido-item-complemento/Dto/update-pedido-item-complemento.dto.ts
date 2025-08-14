import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { IUpdatePedidoItemComplemento } from '../Interfaces/pedido-item-complemento.interface';

export class UpdatePedidoItemComplementoDto implements IUpdatePedidoItemComplemento {
  @IsOptional()
  @IsNumber({}, { message: 'El ID del pedido item debe ser un número válido' })
  pedido_item_id?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del complemento debe ser un número válido' })
  complemento_id?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La cantidad debe ser un número válido' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Max(100, { message: 'La cantidad no debe exceder 100' })
  cantidad?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El precio unitario debe ser un número válido' })
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  precio_unitario?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El subtotal debe ser un número válido' })
  @Min(0, { message: 'El subtotal no puede ser negativo' })
  subtotal?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del usuario de modificación debe ser un número' })
  usuario_modifica?: number;
}
