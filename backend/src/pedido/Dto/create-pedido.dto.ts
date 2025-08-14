import { IsNotEmpty, IsString, IsNumber, MaxLength, MinLength, IsOptional } from 'class-validator';
import { ICreatePedido } from '../Interfaces/pedido.interface';

export class CreatePedidoDto implements ICreatePedido {
  @IsNotEmpty({ message: 'El código es obligatorio' })
  @IsString()
  @MinLength(3, { message: 'El código debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El código no debe exceder 50 caracteres' })
  codigo: string;

  @IsNotEmpty({ message: 'El estado del pedido es obligatorio' })
  @IsString()
  @MinLength(3, { message: 'El estado del pedido debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El estado del pedido no debe exceder 50 caracteres' })
  estado_pedido: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Las notas no deben exceder 1000 caracteres' })
  notas?: string;

  @IsNotEmpty({ message: 'El ID del usuario de ingreso es obligatorio' })
  @IsNumber({}, { message: 'El ID del usuario de ingreso debe ser un número' })
  usuario_ingreso: number;
}
