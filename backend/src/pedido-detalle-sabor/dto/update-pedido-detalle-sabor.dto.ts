import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreatePedidoDetalleSaborDto } from './create-pedido-detalle-sabor.dto';

export class UpdatePedidoDetalleSaborDto extends PartialType(CreatePedidoDetalleSaborDto) {
  @IsOptional()
  @IsBoolean({ message: 'El campo esta_activo debe ser un valor booleano' })
  esta_activo?: boolean;
}
