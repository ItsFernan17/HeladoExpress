import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { IUpdateUsuario } from '../Interfaces/usuario.interface';

export class UpdateUsuarioDto implements IUpdateUsuario {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsOptional()
  @MinLength(4, { message: 'El nombre del usuario debe tener al menos 4 caracteres' })
  @MaxLength(50, { message: 'El nombre del usuario no debe exceder 50 caracteres' })
  nombre?: string;    
}