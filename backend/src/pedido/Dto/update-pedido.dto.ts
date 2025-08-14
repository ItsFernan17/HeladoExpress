import { IsOptional, IsString, IsNumber, MaxLength, MinLength } from 'class-validator';
import { IUpdatePedido } from '../Interfaces/pedido.interface';

export class UpdatePedidoDto implements IUpdatePedido {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El código debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El código no debe exceder 50 caracteres' })
  codigo?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El estado del pedido debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El estado del pedido no debe exceder 50 caracteres' })
  estado_pedido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Las notas no deben exceder 1000 caracteres' })
  notas?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del usuario de modificación debe ser un número' })
  usuario_modifica?: number;
}
