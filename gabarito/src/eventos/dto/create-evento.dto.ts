import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Documentado à mão com @ApiProperty (Sessão 3, passo 1).
export class CreateEventoDto {
  @ApiProperty({ description: 'Título do evento', example: 'Reunião de planejamento' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ description: 'Início em ISO 8601', example: '2026-11-10T14:00:00.000Z' })
  @IsDateString()
  inicio: string;

  @ApiProperty({ description: 'Onde acontece', example: 'Sala 2', required: false })
  @IsOptional()
  @IsString()
  local?: string;
}
