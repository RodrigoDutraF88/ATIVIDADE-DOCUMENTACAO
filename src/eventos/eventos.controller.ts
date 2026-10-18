import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Evento } from './evento.entity';
import { EventosService } from './eventos.service';

@Controller('eventos')
export class EventosController {
  constructor(private readonly eventos: EventosService) {}

  @Get()
  listar(@Query('de') de?: string): Evento[] {
    return this.eventos.listar(de);
  }

  @Get(':id')
  buscar(@Param('id') id: string): Evento {
    return this.eventos.buscar(id);
  }

  @Post()
  criar(@Body() dados: CreateEventoDto): Evento {
    return this.eventos.criar(dados);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dados: UpdateEventoDto): Evento {
    return this.eventos.atualizar(id, dados);
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id') id: string): void {
    this.eventos.remover(id);
  }
}
