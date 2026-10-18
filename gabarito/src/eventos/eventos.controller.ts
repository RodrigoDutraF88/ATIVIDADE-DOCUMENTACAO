import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ErroDto } from '../comum/erro.dto';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Evento } from './evento.entity';
import { EventosService } from './eventos.service';

@ApiTags('eventos')
@Controller('eventos')
export class EventosController {
  constructor(private readonly eventos: EventosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os eventos', description: 'Ordenados pelo início. Use `de` para ver só os eventos a partir de uma data.' })
  @ApiQuery({ name: 'de', required: false, description: 'Data mínima de início (ISO 8601)', example: '2026-11-01' })
  @ApiOkResponse({ type: [Evento] })
  @ApiBadRequestResponse({ type: ErroDto, description: '`de` não é uma data válida' })
  listar(@Query('de') de?: string): Evento[] {
    return this.eventos.listar(de);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um evento', description: 'Devolve o evento com o id informado.' })
  @ApiParam({ name: 'id', description: 'Id do evento', example: 'seed-daily' })
  @ApiOkResponse({ type: Evento })
  @ApiNotFoundResponse({ type: ErroDto, description: 'Evento não existe' })
  buscar(@Param('id') id: string): Evento {
    return this.eventos.buscar(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um evento', description: 'O `fim`, se vier, não pode ser antes do `inicio`.' })
  @ApiCreatedResponse({ type: Evento })
  @ApiBadRequestResponse({ type: ErroDto, description: 'Body inválido' })
  criar(@Body() dados: CreateEventoDto): Evento {
    return this.eventos.criar(dados);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edita um evento', description: 'Só os campos enviados mudam.' })
  @ApiParam({ name: 'id', description: 'Id do evento', example: 'seed-daily' })
  @ApiOkResponse({ type: Evento })
  @ApiBadRequestResponse({ type: ErroDto, description: 'Body inválido' })
  @ApiNotFoundResponse({ type: ErroDto, description: 'Evento não existe' })
  atualizar(@Param('id') id: string, @Body() dados: UpdateEventoDto): Evento {
    return this.eventos.atualizar(id, dados);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um evento', description: 'Apaga o evento de vez. Não devolve corpo.' })
  @ApiParam({ name: 'id', description: 'Id do evento', example: 'seed-daily' })
  @ApiNoContentResponse({ description: 'Evento removido' })
  @ApiNotFoundResponse({ type: ErroDto, description: 'Evento não existe' })
  remover(@Param('id') id: string): void {
    this.eventos.remover(id);
  }
}
