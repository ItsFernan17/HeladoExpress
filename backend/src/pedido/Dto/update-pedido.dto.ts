import { IsOptional, IsBoolean, IsInt, IsPositive } from 'class-validator';

export class UpdatePedidoDto {
  @IsOptional()
  @IsInt({ message: 'El estado debe ser un número entero' })
  @IsPositive({ message: 'El estado debe ser un número positivo' })
  estado_id?: number;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  esta_activo?: boolean;
}
