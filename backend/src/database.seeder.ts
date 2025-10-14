import { Injectable } from '@nestjs/common';
import { EstadoSeeder } from './estado/seeds/estado.seed';
import { CategoriaSeeder } from './categoria/seeds/categoria.seed';
import { ProductoSeeder } from './producto/seeds/producto.seed';
import { SaborSeeder } from './sabor/seeds/sabor.seed';

@Injectable()
export class DatabaseSeeder {
  constructor(
    private readonly estadoSeeder: EstadoSeeder,
    private readonly categoriaSeeder: CategoriaSeeder,
    private readonly productoSeeder: ProductoSeeder,
    private readonly saborSeeder: SaborSeeder,
  ) {}

  async seedAll(): Promise<void> {
    console.log('🚀 Iniciando seeding de la base de datos...');
    
    try {
      // Seed Estados (primero)
      await this.estadoSeeder.seed();
      
      // Seed Categorías (segundo)
      await this.categoriaSeeder.seed();
      
      // Seed Productos (tercero - depende de categorías)
      await this.productoSeeder.seed();
      
      // Seed Sabores (cuarto - independiente)
      await this.saborSeeder.seed();
      
      console.log('✨ Seeding de la base de datos completado exitosamente');
    } catch (error) {
      console.error('❌ Error durante el seeding:', error);
      throw error;
    }
  }
}
