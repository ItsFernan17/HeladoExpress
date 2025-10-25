import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';
import { ICreateImageData, IUpdateImageData } from '../entities/interfaces/image.interface';

@Injectable()
export class ImageRepository {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async create(data: ICreateImageData): Promise<Image> {
    const image = this.imageRepository.create(data);
    return await this.imageRepository.save(image);
  }

  async findAll(): Promise<Image[]> {
    return await this.imageRepository.find({
      order: { created_at: 'DESC' }
    });
  }

  async findById(id: number): Promise<Image | null> {
    return await this.imageRepository.findOne({ where: { id } });
  }

  async findByEntity(entity_type: 'categoria' | 'producto', entity_id: number): Promise<Image | null> {
    return await this.imageRepository.findOne({ 
      where: { entity_type, entity_id, esta_activo: true },
      order: { created_at: 'DESC' }
    });
  }

  async findAllByEntity(entity_type: 'categoria' | 'producto', entity_id: number): Promise<Image[]> {
    return await this.imageRepository.find({ 
      where: { entity_type, entity_id },
      order: { created_at: 'DESC' }
    });
  }

  async findByEntityType(entity_type: 'categoria' | 'producto'): Promise<Image[]> {
    return await this.imageRepository.find({ 
      where: { entity_type, esta_activo: true },
      order: { created_at: 'DESC' }
    });
  }

  async deactivateByEntity(entity_type: 'categoria' | 'producto', entity_id: number): Promise<void> {
    await this.imageRepository.update(
      { entity_type, entity_id, esta_activo: true },
      { esta_activo: false }
    );
  }

  async update(id: number, data: IUpdateImageData): Promise<Image | null> {
    await this.imageRepository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.imageRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByEntity(entity_type: 'categoria' | 'producto', entity_id: number): Promise<boolean> {
    const result = await this.imageRepository.delete({ entity_type, entity_id });
    return (result.affected ?? 0) > 0;
  }
}