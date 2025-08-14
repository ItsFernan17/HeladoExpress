// Interfaz principal para la entidad Sabor
export interface ISabor {
    id: number;
    estado: boolean;
    nombre: string;
    usuario_ingreso: number;
    fecha_ingreso: Date;
    usuario_modifica: number;
    fecha_modifica: Date;
}

// Interfaz para crear un nuevo sabor
export interface ICreateSabor {
    nombre: string;
    usuario_ingreso: number;
}

// Interfaz para actualizar un sabor existente
export interface IUpdateSabor {
    nombre?: string;
    usuario_modifica?: number;
}