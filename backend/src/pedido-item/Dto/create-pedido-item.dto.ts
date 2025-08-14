import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ICreatePedidoItem } from '../Interfaces/pedido-item.interface';

export class CreatePedidoItemDto implements ICreatePedidoItem {
  @IsNotEmpty({ message: 'El ID del pedido es obligatorio' })
  @IsNumber({}, { message: 'El ID del pedido debe ser un número válido' })
  pedidoId: number;

  @IsNotEmpty({ message: 'El ID del tipo de helado es obligatorio' })
  @IsNumber({}, { message: 'El ID del tipo de helado debe ser un número válido' })
  tipo_heladoID: number;

  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsNumber({}, { message: 'La cantidad debe ser un número válido' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Max(100, { message: 'La cantidad no debe exceder 100' })
  cantidad: number;

  @IsNotEmpty({ message: 'El número de bolas solicitadas es obligatorio' })
  @IsNumber({}, { message: 'El número de bolas debe ser un número válido' })
  @Min(1, { message: 'El número de bolas debe ser al menos 1' })
  @Max(10, { message: 'El número de bolas no debe exceder 10' })
  bolas_solicitadas: number;

  @IsNotEmpty({ message: 'El precio unitario es obligatorio' })
  @IsNumber({}, { message: 'El precio unitario debe ser un número válido' })
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  precio_unitario: number;

  @IsOptional()
  @IsNumber({}, { message: 'El precio por bola extra debe ser un número válido' })
  @Min(0, { message: 'El precio por bola extra no puede ser negativo' })
  precio_unitario_bola_extra?: number;

  @IsNotEmpty({ message: 'El subtotal es obligatorio' })
  @IsNumber({}, { message: 'El subtotal debe ser un número válido' })
  @Min(0, { message: 'El subtotal no puede ser negativo' })
  subtotal: number;

  @IsNotEmpty({ message: 'El ID del usuario de ingreso es obligatorio' })
  @IsNumber({}, { message: 'El ID del usuario de ingreso debe ser un número' })
  usuario_ingreso: number;
}
