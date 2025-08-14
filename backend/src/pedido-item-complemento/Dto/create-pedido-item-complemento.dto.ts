import { IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ICreatePedidoItemComplemento } from '../Interfaces/pedido-item-complemento.interface';

export class CreatePedidoItemComplementoDto implements ICreatePedidoItemComplemento {
  @IsNotEmpty({ message: 'El ID del pedido item es obligatorio' })
  @IsNumber({}, { message: 'El ID del pedido item debe ser un número válido' })
  pedido_item_id: number;

  @IsNotEmpty({ message: 'El ID del complemento es obligatorio' })
  @IsNumber({}, { message: 'El ID del complemento debe ser un número válido' })
  complemento_id: number;

  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsNumber({}, { message: 'La cantidad debe ser un número válido' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Max(100, { message: 'La cantidad no debe exceder 100' })
  cantidad: number;

  @IsNotEmpty({ message: 'El precio unitario es obligatorio' })
  @IsNumber({}, { message: 'El precio unitario debe ser un número válido' })
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  precio_unitario: number;

  @IsNotEmpty({ message: 'El subtotal es obligatorio' })
  @IsNumber({}, { message: 'El subtotal debe ser un número válido' })
  @Min(0, { message: 'El subtotal no puede ser negativo' })
  subtotal: number;

  @IsNotEmpty({ message: 'El ID del usuario de ingreso es obligatorio' })
  @IsNumber({}, { message: 'El ID del usuario de ingreso debe ser un número' })
  usuario_ingreso: number;
}
