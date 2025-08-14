import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { IUpdatePedidoItem } from '../Interfaces/pedido-item.interface';

export class UpdatePedidoItemDto implements IUpdatePedidoItem {
  @IsOptional()
  @IsNumber({}, { message: 'El ID del pedido debe ser un número válido' })
  pedidoId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del tipo de helado debe ser un número válido' })
  tipo_heladoID?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La cantidad debe ser un número válido' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Max(100, { message: 'La cantidad no debe exceder 100' })
  cantidad?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El número de bolas debe ser un número válido' })
  @Min(1, { message: 'El número de bolas debe ser al menos 1' })
  @Max(10, { message: 'El número de bolas no debe exceder 10' })
  bolas_solicitadas?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El precio unitario debe ser un número válido' })
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  precio_unitario?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El precio por bola extra debe ser un número válido' })
  @Min(0, { message: 'El precio por bola extra no puede ser negativo' })
  precio_unitario_bola_extra?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El subtotal debe ser un número válido' })
  @Min(0, { message: 'El subtotal no puede ser negativo' })
  subtotal?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del usuario de modificación debe ser un número' })
  usuario_modifica?: number;
}
