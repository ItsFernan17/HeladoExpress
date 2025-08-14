import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';
import { ICreateComplemento } from '../Interfaces/complemento.interface';

export class CreateComplementoDto implements ICreateComplemento {
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @MinLength(4, { message: 'El nombre del complemento debe tener al menos 4 caracteres' })
    @MaxLength(50, { message: 'El nombre del complemento no debe exceder 50 caracteres' })
    nombre: string;

    @IsNotEmpty({ message: 'El precio es obligatorio' })
    @IsNumber({}, { message: 'El precio debe ser un número válido' })
    precio: number;
    
    @IsNotEmpty({ message: 'El ID del usuario de ingreso es obligatorio' })
    @IsNumber({}, { message: 'El ID del usuario de ingreso debe ser un número' })
    usuario_ingreso: number;
}