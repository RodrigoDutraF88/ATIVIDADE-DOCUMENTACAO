import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsDateString()
  inicio: string;

  @IsOptional()
  @IsDateString()
  fim?: string;

  @IsOptional()
  @IsString()
  local?: string;
}
