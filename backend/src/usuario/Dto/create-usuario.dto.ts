import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ICreateUsuario } from '../Interfaces/usuario.interface';

export class CreateUsuarioDto implements ICreateUsuario {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(4, { message: 'El nombre del usuario debe tener al menos 4 caracteres' })
  @MaxLength(50, { message: 'El nombre del usuario no debe exceder 50 caracteres' })
  nombre: string;
}
