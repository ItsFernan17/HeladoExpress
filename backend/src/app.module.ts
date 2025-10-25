import { Module, Controller, Get, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EstadoModule } from './estado/estado.module';
import { SaborModule } from './sabor/sabor.module';
import { PedidoModule } from './pedido/pedido.module';
import { CategoriaModule } from './categoria/categoria.module';
import { ProductoModule } from './producto/producto.module';
import { DetallePedidoModule } from './detalle-pedido/detalle-pedido.module';
import { PedidoDetalleSaborModule } from './pedido-detalle-sabor/pedido-detalle-sabor.module';
import { ImageModule } from './image/image.module';
import { EstadoSeeder } from './estado/seeds/estado.seed';
import { CategoriaSeeder } from './categoria/seeds/categoria.seed';
import { ProductoSeeder } from './producto/seeds/producto.seed';
import { SaborSeeder } from './sabor/seeds/sabor.seed';
import { DatabaseSeeder } from './database.seeder';

@Controller()
class AppController implements OnModuleInit {
  constructor(private readonly databaseSeeder: DatabaseSeeder) {}

  async onModuleInit() {
    // Ejecutar seeding automáticamente al iniciar la aplicación
    try {
      console.log('🔄 Verificando datos iniciales...');
      await this.databaseSeeder.seedAll();
      console.log('✅ Datos iniciales verificados/cargados');
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
      // No lanzamos error para no detener el inicio de la aplicación
    }
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Helado Express API',
      version: '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({ 
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      dropSchema: false, 
    }),
    EstadoModule,
    SaborModule,
    PedidoModule,
    CategoriaModule,
    ProductoModule,
    DetallePedidoModule,
    PedidoDetalleSaborModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [
    EstadoSeeder,
    CategoriaSeeder,
    ProductoSeeder,
    SaborSeeder,
    DatabaseSeeder
  ],
})
export class AppModule {}
