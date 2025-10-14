import { Injectable } from '@nestjs/common';
import { ProductoService } from '../services/producto.service';
import { CategoriaService } from '../../categoria/services/categoria.service';
import { CreateProductoDto } from '../dto/create-producto.dto';

@Injectable()
export class ProductoSeeder {
  constructor(
    private readonly productoService: ProductoService,
    private readonly categoriaService: CategoriaService,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Iniciando seeding de Productos...');

    // Obtener las categorías por nombre
    const especialidades = await this.categoriaService.findByNombre('Especialidades');
    const conos = await this.categoriaService.findByNombre('Conos');
    const bebidas = await this.categoriaService.findByNombre('Bebidas');

    if (!especialidades || !conos || !bebidas) {
      console.error('❌ Error: No se encontraron todas las categorías requeridas');
      console.log('   Asegúrate de ejecutar el seeder de categorías primero');
      return;
    }

    // Productos de Especialidades
    const productosEspecialidades: Omit<CreateProductoDto, 'categoria_id'>[] = [
      { nombre: 'Bomba', precio_base: 32 },
      { nombre: 'Banana Split', precio_base: 30 },
      { nombre: 'Sundae Especial', precio_base: 28 },
      { nombre: 'Canasta Sundae', precio_base: 26 },
      { nombre: 'Sundae Galleta', precio_base: 24 },
      { nombre: 'Topping Sundae', precio_base: 20 },
    ];

    // Productos de Conos
    const productosConos: Omit<CreateProductoDto, 'categoria_id'>[] = [
      { nombre: 'Choco Waffle', precio_base: 21 },
      { nombre: 'Double Capuchino Waffle', precio_base: 21 },
      { nombre: 'Waffle Topping', precio_base: 16 },
      { nombre: 'Waffle Double', precio_base: 18 },
    ];

    // Productos de Bebidas
    const productosBebidas: Omit<CreateProductoDto, 'categoria_id'>[] = [
      { nombre: 'Milkshake', precio_base: 26 },
      { nombre: 'Topping Shake', precio_base: 28 },
      { nombre: 'Nevada', precio_base: 28 },
    ];

    // Crear productos de Especialidades
    await this.createProductosForCategoria(
      productosEspecialidades, 
      especialidades.id, 
      'Especialidades'
    );

    // Crear productos de Conos
    await this.createProductosForCategoria(
      productosConos, 
      conos.id, 
      'Conos'
    );

    // Crear productos de Bebidas
    await this.createProductosForCategoria(
      productosBebidas, 
      bebidas.id, 
      'Bebidas'
    );

    console.log('🎉 Seeding de Productos completado');
  }

  private async createProductosForCategoria(
    productos: Omit<CreateProductoDto, 'categoria_id'>[],
    categoriaId: number,
    categoriaNombre: string
  ): Promise<void> {
    console.log(`📦 Creando productos para categoría: ${categoriaNombre}`);

    for (const productoData of productos) {
      // Verificar si el producto ya existe
      const existingProducto = await this.productoService.findByNombre(productoData.nombre);
      
      if (!existingProducto) {
        const createProductoDto: CreateProductoDto = {
          ...productoData,
          categoria_id: categoriaId,
        };
        
        await this.productoService.create(createProductoDto);
        console.log(`   ✅ Producto "${productoData.nombre}" creado (Precio: $${productoData.precio_base})`);
      } else {
        console.log(`   ⚠️  Producto "${productoData.nombre}" ya existe, saltando...`);
      }
    }
  }
}
