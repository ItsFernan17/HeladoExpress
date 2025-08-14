// Interfaz principal para la entidad Usuario
export interface IUsuario {
    id: number;
    nombre: string;
    estado: boolean;
}

// Interfaz para crear un nuevo usuario
export interface ICreateUsuario {
    nombre: string;
}

// Interfaz para actualizar un usuario existente
export interface IUpdateUsuario {
    nombre?: string;
}