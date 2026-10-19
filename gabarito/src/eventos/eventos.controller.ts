import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
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
  @ApiOperation({ summary: 'Lista os eventos', description: 'Todos os eventos, ordenados pelo início.' })
  @ApiOkResponse({ type: [Evento] })
  listar(): Evento[] {
    return this.eventos.listar();
  }

  @Post()
  @ApiOperation({ summary: 'Cria um evento', description: 'Cria o evento e devolve com id e data de criação.' })
  @ApiCreatedResponse({ type: Evento })
  @ApiBadRequestResponse({ type: ErroDto, description: 'Body inválido' })
  criar(@Body() dados: CreateEventoDto): Evento {
    return this.eventos.criar(dados);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edita um evento', description: 'Só os campos enviados mudam.' })
  @ApiOkResponse({ type: Evento })
  @ApiNotFoundResponse({ type: ErroDto, description: 'Evento não existe' })
  atualizar(@Param('id') id: string, @Body() dados: UpdateEventoDto): Evento {
    return this.eventos.atualizar(id, dados);
  }
}
