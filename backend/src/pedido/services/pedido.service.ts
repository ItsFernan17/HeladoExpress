import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { CreatePedidoDto } from '../dto/create-pedido.dto';
import { CreatePedidoCompleteDto } from '../dto/create-pedido-complete.dto';
import { UpdatePedidoDto } from '../dto/update-pedido.dto';

import { Pedido } from '../entities/pedido.entity';
import { DetallePedido } from '../../detalle-pedido/entities/detalle-pedido.entity';
import { PedidoDetalleSabor } from '../../pedido-detalle-sabor/entities/pedido-detalle-sabor.entity';

import { IPedidoService } from '../entities/interfaces/pedido-service.interface';
import { PedidoRepository } from '../repositories/pedido.repository';

import { EstadoService } from '../../estado/services/estado.service';
import { DetallePedidoService } from '../../detalle-pedido/services/detalle-pedido.service';
import { ProductoService } from '../../producto/services/producto.service';
import { SaborService } from '../../sabor/services/sabor.service';

import { CreateDetallePedidoDto } from '../../detalle-pedido/dto/create-detalle-pedido.dto';

// ================== Tipos locales para respuestas ==================
type PedidoCompletoItem = {
  tipo: string;
  nombre: string;
  sabores: string[];
  cantidad: number;
  subtotal: number;
};

type PedidoCompletoDTO = {
  pedido: string;
  estado: string;
  items: PedidoCompletoItem[];
  total: number;
};

@Injectable()
export class PedidoService implements IPedidoService {
  private readonly logger = new Logger(PedidoService.name);

  private pedidoDetalleSaborRepo: Repository<PedidoDetalleSabor>;
  private detallePedidoRepo: Repository<DetallePedido>;
  private pedidoRepoNative: Repository<Pedido>;

  constructor(
    private readonly pedidoRepository: PedidoRepository,
    private readonly estadoService: EstadoService,
    @Inject(forwardRef(() => DetallePedidoService))
    private readonly detallePedidoService: DetallePedidoService,
    private readonly productoService: ProductoService,
    private readonly saborService: SaborService,
    private readonly dataSource: DataSource,
  ) {
    this.pedidoDetalleSaborRepo = this.dataSource.getRepository(PedidoDetalleSabor);
    this.detallePedidoRepo = this.dataSource.getRepository(DetallePedido);
    this.pedidoRepoNative = this.dataSource.getRepository(Pedido);
  }

  // ================== CRUD ==================

  async create(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    const estado = await this.estadoService.findOne(createPedidoDto.estado_id);

    if (!createPedidoDto.detalles?.length) {
      throw new BadRequestException('El pedido debe tener al menos un detalle');
    }

    const productosIds = createPedidoDto.detalles.map((d) => d.producto_id);
    const productosUnicos = new Set(productosIds);
    if (productosIds.length !== productosUnicos.size) {
      throw new BadRequestException('No se pueden incluir productos duplicados en el mismo pedido');
    }
    await Promise.all(productosIds.map((id) => this.productoService.findOne(id)));

    const numeroPedido = await this.generateNextPedidoNumber();

    const pedido = this.pedidoRepository.create({
      numero: numeroPedido,
      estado_id: estado,
      esta_activo: true,
    });
    const pedidoGuardado = await this.pedidoRepository.save(pedido);

    try {
      for (const d of createPedidoDto.detalles) {
        const producto = await this.productoService.findOne(d.producto_id);
        const subtotal = d.cantidad * Number(producto.precio_base);

        const createDetalleDto: CreateDetallePedidoDto = {
          pedido_id: pedidoGuardado.id,
          producto_id: d.producto_id,
          cantidad: d.cantidad,
          precio_unitario: Number(producto.precio_base),
          subtotal,
        };
        await this.detallePedidoService.create(createDetalleDto);
      }
    } catch (err: any) {
      this.logger.error(`Error creando detalles: ${err?.message}`);
      await this.pedidoRepository.softDeleteById(pedidoGuardado.id);
      throw new BadRequestException(`Error creando los detalles del pedido: ${err?.message}`);
    }

    return await this.findOne(pedidoGuardado.id);
  }

  async findAll(): Promise<Pedido[]> {
    return this.pedidoRepository.findActiveStates();
  }

  async findOne(id: number): Promise<Pedido & { total: number }> {
    if (!id || id <= 0) throw new BadRequestException('El ID del pedido debe ser un número positivo');

    const pedido = await this.pedidoRepository.findActiveById(id);
    if (!pedido) throw new NotFoundException(`Pedido con ID ${id} no encontrado`);

    const total = await this.calculateTotal(id);
    return { ...pedido, total };
  }

  async findByNumero(numero: string): Promise<Pedido> {
    if (!numero?.trim()) throw new BadRequestException('El número de pedido es requerido');

    const pedido = await this.pedidoRepository.findByNumero(numero);
    if (!pedido) throw new NotFoundException(`Pedido con número ${numero} no encontrado`);

    return pedido;
  }

  async findPedidosByEstado(estadoId: number): Promise<Pedido[]> {
    await this.estadoService.findOne(estadoId);
    return this.pedidoRepository.findByEstado(estadoId);
  }

  async countPedidosByEstado(estadoId: number): Promise<number> {
    await this.estadoService.findOne(estadoId);
    return this.pedidoRepository.countByEstado(estadoId);
  }

  async updateEstado(id: number, estadoId: number): Promise<Pedido> {
    const pedido = await this.findOne(id);
    const nuevoEstado = await this.estadoService.findOne(estadoId);

    const actualId = typeof (pedido as any).estado_id === 'object'
      ? (pedido as any).estado_id.id
      : (pedido as any).estado_id;

    if (!this.canChangeToEstado(actualId, estadoId)) {
      throw new ForbiddenException(`No se puede cambiar del estado ${actualId} al estado ${estadoId}`);
    }

    (pedido as any).estado_id = nuevoEstado;
    return this.pedidoRepository.save(pedido);
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto): Promise<Pedido> {
    const pedido = await this.findOne(id);

    if (updatePedidoDto.estado_id) {
      return this.updateEstado(id, updatePedidoDto.estado_id);
    }

    if (typeof updatePedidoDto.esta_activo === 'boolean') {
      (pedido as any).esta_activo = updatePedidoDto.esta_activo;
    }

    return this.pedidoRepository.save(pedido);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    const tieneDetalles = await this.pedidoRepository.hasDetalles(id);
    if (tieneDetalles) {
      throw new ForbiddenException('No se puede eliminar un pedido que tiene detalles asociados');
    }

    await this.pedidoRepository.softDeleteById(id);
  }

  async cancelPedido(id: number): Promise<Pedido> {
    const pedido = await this.findOne(id);
    const actualId = typeof (pedido as any).estado_id === 'object'
      ? (pedido as any).estado_id.id
      : (pedido as any).estado_id;

    if (!this.canBeCanceled(actualId)) {
      throw new ForbiddenException('El pedido no puede ser cancelado en su estado actual');
    }

    const estadoCancelado = await this.estadoService.findByNombre('Cancelado');
    if (!estadoCancelado) throw new NotFoundException('Estado "Cancelado" no encontrado');

    (pedido as any).estado_id = estadoCancelado;
    return this.pedidoRepository.save(pedido);
  }

  async getTotalPedidos(): Promise<number> {
    return this.pedidoRepository.getTotalCount();
  }

  async getPedidosActivosCount(): Promise<number> {
    return this.pedidoRepository.getActiveCount();
  }

  // ================== Reglas de transición ==================

  private validatePedidoNumber(numero: string): boolean {
    return /^P\d{4}$/.test(numero);
  }

  private async generateNextPedidoNumber(): Promise<string> {
    const last = await this.pedidoRepository.getLastPedidoNumber();
    let nextNumber = 1;
    if (last) nextNumber = parseInt(last.substring(1), 10) + 1;

    if (nextNumber > 9999) {
      throw new BadRequestException('Se alcanzó el máximo de números de pedido (P9999)');
    }
    return `P${`${nextNumber}`.padStart(4, '0')}`;
  }

  private canChangeToEstado(estadoActualId: number, nuevoEstadoId: number): boolean {
    const transicionesPermitidas: Record<number, number[]> = {
      1: [2, 5], // Pendiente -> En Proceso, Cancelado
      2: [3, 5], // En Proceso -> Completado, Cancelado
      3: [],     // Completado -> No se puede cambiar
      4: [],     // Entregado -> No se puede cambiar
      5: [],     // Cancelado -> No se puede cambiar
    };
    return transicionesPermitidas[estadoActualId]?.includes(nuevoEstadoId) ?? false;
  }

  private canBeCanceled(estadoId: number): boolean {
    return [1, 2].includes(estadoId);
  }

  private isValidTransition(estadoActualId: number, nuevoEstadoId: number): boolean {
    // 1 = Nuevo, 2 = Preparado, 3 = Entregado
    const transicionesPermitidas: Record<number, number[]> = {
      1: [2],
      2: [3],
      3: [],
    };
    return transicionesPermitidas[estadoActualId]?.includes(nuevoEstadoId) ?? false;
  }

  // ================== Cálculos ==================

  async calculateTotal(pedidoId: number): Promise<number> {
    const { total } =
      (await this.detallePedidoRepo
        .createQueryBuilder('d')
        .select('COALESCE(SUM(d.subtotal), 0)', 'total')
        .where('d.pedido_id = :pedidoId', { pedidoId })
        .andWhere('d.esta_activo = true')
        .getRawOne<{ total: string | number }>()) || { total: 0 };

    return Number(total) || 0;
  }

  // ================== Cambio de estado con validación ==================

  async changeStatus(pedidoId: number, nuevoEstadoId: number): Promise<Pedido & { total: number }> {
    const pedido = await this.pedidoRepository.findActiveById(pedidoId);
    if (!pedido) throw new NotFoundException(`Pedido con ID ${pedidoId} no encontrado`);

    const nuevoEstado = await this.estadoService.findOne(nuevoEstadoId);
    if (!nuevoEstado) throw new NotFoundException(`Estado con ID ${nuevoEstadoId} no encontrado`);

    const estadoActualId = typeof (pedido as any).estado_id === 'object'
      ? (pedido as any).estado_id.id
      : (pedido as any).estado_id;

    if (!this.isValidTransition(estadoActualId, nuevoEstadoId)) {
      const estadoActual = await this.estadoService.findOne(estadoActualId);
      throw new BadRequestException(
        `No se puede cambiar el estado de "${(estadoActual as any).nombre}" a "${(nuevoEstado as any).nombre}"`,
      );
    }

    await this.pedidoRepository.save({ ...pedido, estado_id: nuevoEstado });
    return this.findOne(pedidoId);
  }

  // ================== Create completo (transacción única) ==================

  async createComplete(createPedidoCompleteDto: CreatePedidoCompleteDto): Promise<Pedido & { total: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!createPedidoCompleteDto.items?.length) {
        throw new BadRequestException('Los items del pedido no pueden estar vacíos');
      }

      for (const item of createPedidoCompleteDto.items) {
        if (!item || item.cantidad <= 0) {
          throw new BadRequestException('Cada item debe tener cantidad > 0');
        }
      }

      await Promise.all(
        createPedidoCompleteDto.items.map(async (item) => {
          const prod = await this.productoService.findOne(item.productoId);
          if (!prod?.esta_activo) {
            throw new BadRequestException(`El producto con ID ${item.productoId} no existe o no está activo`);
          }
        }),
      );

      const saborIds = createPedidoCompleteDto.items
        .flatMap((i) => i.sabores || [])
        .filter((v) => v !== undefined && v !== null);
      if (saborIds.length) {
        await Promise.all(
          saborIds.map(async (sid) => {
            const s = await this.saborService.findOne(sid);
            if (!s?.esta_activo) {
              throw new BadRequestException(`El sabor con ID ${sid} no existe o no está activo`);
            }
          }),
        );
      }

      const estadoNuevo = await this.estadoService.findByNombre('Nuevo');
      if (!estadoNuevo) throw new NotFoundException('Estado "Nuevo" no encontrado');

      const numeroPedido = await this.generateNextPedidoNumber();

      const pedido = queryRunner.manager.create(Pedido, {
        numero: numeroPedido,
        estado_id: estadoNuevo,
        esta_activo: true,
      });
      const savedPedido = await queryRunner.manager.save(pedido);

      for (const item of createPedidoCompleteDto.items) {
        const producto = await this.productoService.findOne(item.productoId);

        const detalle = queryRunner.manager.create(DetallePedido, {
          pedido_id: savedPedido,
          producto_id: producto,
          cantidad: item.cantidad,
          precio_unitario: Number(producto.precio_base),
          subtotal: Number(producto.precio_base) * item.cantidad,
          esta_activo: true,
        });
        const savedDetalle = await queryRunner.manager.save(detalle);

        if (item.sabores?.length) {
          for (const saborId of item.sabores) {
            const pds = queryRunner.manager.create(PedidoDetalleSabor, {
              detalle_pedido_id: savedDetalle.id,
              sabor_id: saborId,
              esta_activo: true,
            });
            await queryRunner.manager.save(pds);
          }
        }
      }

      await queryRunner.commitTransaction();

      const total = await this.calculateTotal((savedPedido as any).id);
      return { ...(savedPedido as any), total };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`createComplete() rollback: ${error?.message}`, error?.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ================== Estados disponibles ==================

  async getAvailableStates(pedidoId: number) {
    const pedido = await this.pedidoRepository.findActiveById(pedidoId);
    if (!pedido) throw new NotFoundException(`Pedido con ID ${pedidoId} no encontrado`);

    const estadoActualId = typeof (pedido as any).estado_id === 'object'
      ? (pedido as any).estado_id.id
      : (pedido as any).estado_id;

    const transicionesPermitidas: Record<number, number[]> = {
      1: [2],
      2: [3],
      3: [],
    };
    const estadosIds = transicionesPermitidas[estadoActualId] || [];
    const estadosDisponibles = await Promise.all(estadosIds.map((id) => this.estadoService.findOne(id)));

    return {
      pedidoId,
      estadoActual: (pedido as any).estado_id,
      estadosDisponibles,
    };
  }

  // ================== Listados completos ==================

  async getAllPedidosCompletos(): Promise<PedidoCompletoDTO[]> {
    this.logger.log('getAllPedidosCompletos: iniciando');

    const pedidos = await this.pedidoRepository.findActiveStates();
    this.logger.log(`getAllPedidosCompletos: encontrados ${pedidos.length} pedidos`);

    // Tipado explícito para evitar never[]
    const result: PedidoCompletoDTO[] = [];
    for (const p of pedidos) {
      result.push(await this.getPedidoCompleto(p.id));
    }
    return result;

    // Alternativa: en paralelo
    // return Promise.all(pedidos.map((p) => this.getPedidoCompleto(p.id)));
  }

  async getPedidoCompleto(pedidoId: number): Promise<PedidoCompletoDTO> {
    this.logger.debug(`getPedidoCompleto: pedidoId=${pedidoId}`);

    const pedido = await this.pedidoRepository.findActiveById(pedidoId);
    if (!pedido) throw new NotFoundException(`Pedido con ID ${pedidoId} no encontrado`);

    const detalles = await this.detallePedidoService.findByPedido(pedidoId);

    const detalleIds = detalles.map((d) => d.id);
    const pds = detalleIds.length
      ? await this.pedidoDetalleSaborRepo
          .createQueryBuilder('pds')
          .leftJoinAndSelect('pds.sabor', 'sabor')
          .where('pds.detalle_pedido_id IN (:...ids)', { ids: detalleIds })
          .andWhere('pds.esta_activo = true')
          .getMany()
      : [];

    const mapSaboresPorDetalle = new Map<number, string[]>();
    for (const rel of pds) {
      // Normalizar por si detalle_pedido_id es id o entidad
      const detId = Number((rel as any).detalle_pedido_id?.id ?? (rel as any).detalle_pedido_id);
      const nombre: string | undefined = (rel as any).sabor?.nombre;
      if (!detId || !nombre) continue;
      if (!mapSaboresPorDetalle.has(detId)) mapSaboresPorDetalle.set(detId, []);
      mapSaboresPorDetalle.get(detId)!.push(nombre);
    }

    const items: PedidoCompletoItem[] = detalles.map((d) => ({
      tipo: d.producto_id?.categoria_id?.nombre ?? '',
      nombre: d.producto_id?.nombre ?? '',
      sabores: mapSaboresPorDetalle.get(d.id) ?? [],
      cantidad: d.cantidad,
      subtotal: Number(d.subtotal),
    }));

    const total = await this.calculateTotal(pedidoId);

    const estadoNombre =
      typeof (pedido as any).estado_id === 'object'
        ? (pedido as any).estado_id?.nombre ?? ''
        : String((pedido as any).estado_id ?? '');

    return {
      pedido: `#${pedido.numero}`,
      estado: estadoNombre,
      items,
      total,
    };
  }
}
