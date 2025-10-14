import { Injectable } from '@nestjs/common';
import { CategoriaService } from '../services/categoria.service';
import { CreateCategoriaDto } from '../dto/create-categoria.dto';

@Injectable()
export class CategoriaSeeder {
  constructor(private readonly categoriaService: CategoriaService) {}

  async seed(): Promise<void> {
    const categoriasData: CreateCategoriaDto[] = [
      { nombre: 'Especialidades' },
      { nombre: 'Conos' },
      { nombre: 'Bebidas' },
    ];

    console.log('🌱 Iniciando seeding de Categorías...');

    for (const categoriaData of categoriasData) {
      // Verificar si la categoría ya existe
      const existingCategoria = await this.categoriaService.findByNombre(categoriaData.nombre);
      
      if (!existingCategoria) {
        await this.categoriaService.create(categoriaData);
        console.log(`✅ Categoría "${categoriaData.nombre}" creada exitosamente`);
      } else {
        console.log(`⚠️  Categoría "${categoriaData.nombre}" ya existe, saltando...`);
      }
    }

    console.log('🎉 Seeding de Categorías completado');
  }
}
