import { IsString, IsEnum, IsInt, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateImageDto {
  @IsString()
  uuid: string;

  @IsString()
  filename: string;

  @IsString()
  path: string;

  @IsEnum(['categoria', 'producto'])
  entity_type: 'categoria' | 'producto';

  @IsInt()
  entity_id: number;

  @IsOptional()
  @IsString()
  mime_type?: string;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsBoolean()
  esta_activo?: boolean;
}