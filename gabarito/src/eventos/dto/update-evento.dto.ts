import { PartialType } from '@nestjs/swagger';
import { CreateEventoDto } from './create-evento.dto';

// PartialType de @nestjs/swagger, não de @nestjs/mapped-types:
// só a versão do swagger copia os metadados para a documentação.
export class UpdateEventoDto extends PartialType(CreateEventoDto) {}
