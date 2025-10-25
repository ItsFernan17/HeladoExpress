import { Injectable } from '@nestjs/common';
import { SaborService } from '../services/sabor.service';
import { CreateSaborDto } from '../dto/create-sabor.dto';

@Injectable()
export class SaborSeeder {
  constructor(private readonly saborService: SaborService) {}

  async seed(): Promise<void> {
    const saboresData: CreateSaborDto[] = [
      { nombre: 'Queso fresa' },
      { nombre: 'Ron con pasas' },
      { nombre: 'Fresa' },
      { nombre: 'Chocolate' },
      { nombre: 'Vainilla' },
      { nombre: 'Chococereza' },
      { nombre: 'Café Expresso' },
      { nombre: 'Napolitano' },
      { nombre: 'Galleta Oreo' },
      { nombre: 'Chocochips' },
      { nombre: 'Pistacho' },
      { nombre: 'Piña Colada' },
      { nombre: 'Café Capuchino' },
      { nombre: 'Veteado de Mango' },
      { nombre: 'Limón (línea de nieves)' },
      { nombre: 'Mandarina (línea de nieves)' },
      { nombre: 'Uva (línea de nieves)' },
      { nombre: 'Guanábana (línea de nieves)' },
      { nombre: 'Calabaza' },
    ];

    console.log('🌱 Iniciando seeding de Sabores...');

    for (const saborData of saboresData) {
      // Verificar si el sabor ya existe
      const existingSabor = await this.saborService.findByNombre(saborData.nombre);
      
      if (!existingSabor) {
        await this.saborService.create(saborData);
        console.log(`✅ Sabor "${saborData.nombre}" creado exitosamente`);
      } else {
        console.log(`⚠️  Sabor "${saborData.nombre}" ya existe, saltando...`);
      }
    }

    console.log('🎉 Seeding de Sabores completado');
  }
}
