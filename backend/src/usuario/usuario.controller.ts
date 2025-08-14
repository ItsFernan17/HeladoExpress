import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './Dto/create-usuario.dto';
import { UpdateUsuarioDto } from './Dto/update-usuario.dto';
import { DeleteUsuarioDto } from './Dto/delete-usuario.dto';
import { IUsuario } from './Interfaces/usuario.interface';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  // GET todos los usuarios
  @Get()
  async findAll(): Promise<IUsuario[]> {
    return await this.usuarioService.findAll();
  }

  // GET usuario por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<IUsuario> {
    return await this.usuarioService.findOne(id);
  }

  // POST crear nuevo usuario
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUsuarioDto: CreateUsuarioDto): Promise<IUsuario> {
    return await this.usuarioService.create(createUsuarioDto);
  }

  // PUT actualizar usuario
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto
  ): Promise<IUsuario> {
    return await this.usuarioService.update(id, updateUsuarioDto);
  }

  // DELETE eliminación lógica
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() deleteUsuarioDto: DeleteUsuarioDto
  ): Promise<{ message: string }> {
    return await this.usuarioService.remove(id, deleteUsuarioDto.usuario_modifica);
  }
}
