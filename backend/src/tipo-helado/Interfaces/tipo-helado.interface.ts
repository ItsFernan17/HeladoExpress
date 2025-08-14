// Interfaz principal para la entidad TipoHelado
export interface ITipoHelado {
  id: number;
  estado: boolean;
  nombre: string;
  descripcion?: string;
  max_bolas: number;
  precio_base: number;
  precio_bola_adicional: number;
  permite_complemento: boolean;
  usuario_ingreso: number;
  fecha_ingreso: Date;
  usuario_modifica?: number;
  fecha_modifica?: Date;
}

// Interfaz para crear un nuevo tipo de helado
export interface ICreateTipoHelado {
  nombre: string;
  descripcion?: string;
  max_bolas: number;
  precio_base: number;
  precio_bola_adicional?: number;
  permite_complemento?: boolean;
  usuario_ingreso: number;
}

// Interfaz para actualizar un tipo de helado existente
export interface IUpdateTipoHelado {
  nombre?: string;
  descripcion?: string;
  max_bolas?: number;
  precio_base?: number;
  precio_bola_adicional?: number;
  permite_complemento?: boolean;
  usuario_modifica?: number;
}
