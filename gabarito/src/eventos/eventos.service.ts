import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Evento } from './evento.entity';

const SEED: Evento[] = [
  new Evento({
    id: 'seed-daily',
    titulo: 'Daily do projeto',
    inicio: '2026-11-03T12:00:00.000Z',
    fim: '2026-11-03T12:15:00.000Z',
    local: 'Meet',
    criadoEm: '2026-10-01T00:00:00.000Z',
    historico: [],
  }),
  new Evento({
    id: 'seed-review',
    titulo: 'Review da trilha',
    inicio: '2026-11-04T18:00:00.000Z',
    fim: '2026-11-04T19:00:00.000Z',
    local: 'Sala 1',
    criadoEm: '2026-10-01T00:00:00.000Z',
    historico: [],
  }),
];

@Injectable()
export class EventosService {
  private readonly eventos = new Map<string, Evento>(SEED.map((e) => [e.id, e]));

  listar(de?: string): Evento[] {
    if (de !== undefined && Number.isNaN(Date.parse(de))) {
      throw new BadRequestException('de precisa ser uma data válida');
    }
    return [...this.eventos.values()]
      .filter((e) => de === undefined || e.inicio >= new Date(de).toISOString())
      .sort((a, b) => a.inicio.localeCompare(b.inicio));
  }

  buscar(id: string): Evento {
    const evento = this.eventos.get(id);
    if (!evento) throw new NotFoundException(`evento ${id} não encontrado`);
    return evento;
  }

  criar(dados: CreateEventoDto): Evento {
    validarPeriodo(dados.inicio, dados.fim);
    const evento = new Evento({
      id: randomUUID(),
      titulo: dados.titulo.trim(),
      inicio: dados.inicio,
      fim: dados.fim ?? null,
      local: dados.local?.trim() || null,
      criadoEm: new Date().toISOString(),
      historico: [],
    });
    this.eventos.set(evento.id, evento);
    return evento;
  }

  atualizar(id: string, dados: UpdateEventoDto): Evento {
    const evento = this.buscar(id);
    const inicio = dados.inicio ?? evento.inicio;
    const fim = dados.fim ?? evento.fim ?? undefined;
    validarPeriodo(inicio, fim);
    Object.assign(evento, {
      titulo: dados.titulo?.trim() ?? evento.titulo,
      inicio,
      fim: fim ?? null,
      local: dados.local !== undefined ? dados.local.trim() || null : evento.local,
    });
    evento.historico.push(new Date().toISOString());
    return evento;
  }

  remover(id: string): void {
    if (!this.eventos.delete(id)) throw new NotFoundException(`evento ${id} não encontrado`);
  }

  todos(): Evento[] {
    return [...this.eventos.values()];
  }
}

function validarPeriodo(inicio: string, fim?: string) {
  if (fim !== undefined && Date.parse(fim) < Date.parse(inicio)) {
    throw new BadRequestException('fim não pode ser antes de inicio');
  }
}
