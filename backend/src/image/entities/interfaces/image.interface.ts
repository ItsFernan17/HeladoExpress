export interface IImageEntity {
  id: number;
  uuid: string;
  filename: string;
  path: string;
  entity_type: 'categoria' | 'producto';
  entity_id: number;
  mime_type?: string;
  size?: number;
  esta_activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateImageData {
  uuid: string;
  filename: string;
  path: string;
  entity_type: 'categoria' | 'producto';
  entity_id: number;
  mime_type?: string;
  size?: number;
  esta_activo?: boolean;
}

export interface IUpdateImageData {
  filename?: string;
  path?: string;
  mime_type?: string;
  size?: number;
  esta_activo?: boolean;
}