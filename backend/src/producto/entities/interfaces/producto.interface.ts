import { Categoria } from '../../../categoria/entities/categoria.entity';

export interface IProducto {
  id: number;
  categoria_id: Categoria;
  nombre: string;
  precio_base: number;
  esta_activo: boolean;
}
