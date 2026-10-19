import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Evento } from './evento.entity';

const SEED: Evento[] = [
  new Evento({
    id: 'seed-daily',
    titulo: 'Daily do projeto',
    inicio: '2026-11-03T12:00:00.000Z',
    local: 'Meet',
    criadoEm: '2026-10-01T00:00:00.000Z',
    historico: [],
  }),
  new Evento({
    id: 'seed-review',
    titulo: 'Review da trilha',
    inicio: '2026-11-04T18:00:00.000Z',
    local: 'Sala 1',
    criadoEm: '2026-10-01T00:00:00.000Z',
    historico: [],
  }),
];

@Injectable()
export class EventosService {
  private readonly eventos = new Map<string, Evento>(SEED.map((e) => [e.id, e]));

  listar(): Evento[] {
    return [...this.eventos.values()].sort((a, b) => a.inicio.localeCompare(b.inicio));
  }

  criar(dados: CreateEventoDto): Evento {
    const evento = new Evento({
      id: randomUUID(),
      titulo: dados.titulo.trim(),
      inicio: dados.inicio,
      local: dados.local?.trim() || null,
      criadoEm: new Date().toISOString(),
      historico: [],
    });
    this.eventos.set(evento.id, evento);
    return evento;
  }

  atualizar(id: string, dados: UpdateEventoDto): Evento {
    const evento = this.eventos.get(id);
    if (!evento) throw new NotFoundException(`evento ${id} não encontrado`);
    Object.assign(evento, {
      titulo: dados.titulo?.trim() ?? evento.titulo,
      inicio: dados.inicio ?? evento.inicio,
      local: dados.local !== undefined ? dados.local.trim() || null : evento.local,
    });
    evento.historico.push(new Date().toISOString());
    return evento;
  }

  todos(): Evento[] {
    return [...this.eventos.values()];
  }
}
