import { IsNumber, IsPositive } from 'class-validator';

export class ValidatePrecioDto {
  @IsNumber({}, { message: 'El ID del producto debe ser un número' })
  @IsPositive({ message: 'El ID del producto debe ser mayor a 0' })
  productoId: number;

  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @IsPositive({ message: 'El precio unitario debe ser mayor a 0' })
  precioUnitario: number;
}
