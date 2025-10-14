import { Injectable } from '@nestjs/common';
import { EstadoService } from '../services/estado.service';
import { CreateEstadoDto } from '../dto/create-estado.dto';

@Injectable()
export class EstadoSeeder {
  constructor(private readonly estadoService: EstadoService) {}

  async seed(): Promise<void> {
    const estadosData: CreateEstadoDto[] = [
      { nombre: 'Nuevo' },
      { nombre: 'Preparando' },
      { nombre: 'Entregado' },
    ];

    console.log('🌱 Iniciando seeding de Estados...');

    for (const estadoData of estadosData) {
      // Verificar si el estado ya existe
      const existingEstado = await this.estadoService.findByNombre(estadoData.nombre);
      
      if (!existingEstado) {
        await this.estadoService.create(estadoData);
        console.log(`✅ Estado "${estadoData.nombre}" creado exitosamente`);
      } else {
        console.log(`⚠️  Estado "${estadoData.nombre}" ya existe, saltando...`);
      }
    }

    console.log('🎉 Seeding de Estados completado');
  }
}
