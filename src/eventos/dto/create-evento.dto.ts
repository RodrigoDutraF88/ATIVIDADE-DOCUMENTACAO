import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsDateString()
  inicio: string;

  @IsOptional()
  @IsString()
  local?: string;
}
