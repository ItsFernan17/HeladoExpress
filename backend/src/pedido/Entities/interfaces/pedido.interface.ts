import { Estado } from '../../../estado/entities/estado.entity';

export interface IPedido {
  id: number;
  estado_id: Estado;
  numero: string;
  esta_activo: boolean;
}
