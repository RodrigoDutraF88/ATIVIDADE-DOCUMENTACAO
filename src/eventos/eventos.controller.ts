import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Evento } from './evento.entity';
import { EventosService } from './eventos.service';

@Controller('eventos')
export class EventosController {
  constructor(private readonly eventos: EventosService) {}

  @Get()
  listar(): Evento[] {
    return this.eventos.listar();
  }

  @Post()
  criar(@Body() dados: CreateEventoDto): Evento {
    return this.eventos.criar(dados);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dados: UpdateEventoDto): Evento {
    return this.eventos.atualizar(id, dados);
  }
}
