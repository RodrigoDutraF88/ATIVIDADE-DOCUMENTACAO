import { Controller, Get, UseGuards } from '@nestjs/common';
import { EventosService } from '../eventos/eventos.service';
import { AdminGuard } from './admin.guard';
import { EstatisticasDto } from './estatisticas.dto';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly eventos: EventosService) {}

  @Get('estatisticas')
  estatisticas(): EstatisticasDto {
    const todos = this.eventos.todos();
    const agora = new Date().toISOString();
    const proximo = todos
      .filter((e) => e.inicio >= agora)
      .sort((a, b) => a.inicio.localeCompare(b.inicio))[0];
    return {
      totalEventos: todos.length,
      totalAlteracoes: todos.reduce((soma, e) => soma + e.historico.length, 0),
      proximoEvento: proximo?.titulo ?? null,
    };
  }
}
