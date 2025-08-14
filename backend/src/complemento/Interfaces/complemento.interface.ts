// Interfaz principal para la entidad Complemento
export interface IComplemento {
    id: number;
    estado: boolean;
    nombre: string;
    precio: number;
    usuario_ingreso: number;
    fecha_ingreso: Date;
    usuario_modifica?: number;
    fecha_modifica?: Date;
}

// Interfaz para crear un nuevo complemento
export interface ICreateComplemento {
    nombre: string;
    precio: number;
    usuario_ingreso: number;
}

// Interfaz para actualizar un complemento existente
export interface IUpdateComplemento {
    nombre?: string;
    precio?: number;
    usuario_modifica?: number;
}