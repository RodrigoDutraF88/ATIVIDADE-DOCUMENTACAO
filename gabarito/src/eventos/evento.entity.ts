import { ApiHideProperty } from '@nestjs/swagger';

// Os comentários /** */ viram description e example com introspectComments.
export class Evento {
  /**
   * Identificador do evento
   * @example "seed-daily"
   */
  id: string;

  /**
   * Título do evento
   * @example "Daily do projeto"
   */
  titulo: string;

  /**
   * Início em ISO 8601
   * @example "2026-11-03T12:00:00.000Z"
   */
  inicio: string;

  /**
   * Fim em ISO 8601, ou null se não tiver
   * @example "2026-11-03T12:15:00.000Z"
   */
  fim: string | null;

  /**
   * Onde acontece, ou null
   * @example "Meet"
   */
  local: string | null;

  /**
   * Quando o evento foi criado
   * @example "2026-10-01T00:00:00.000Z"
   */
  criadoEm: string;

  // Uso interno: datas de cada alteração, usadas nas estatísticas do admin.
  // Nunca sai nas respostas (veja o toJSON abaixo), então fica fora da documentação.
  @ApiHideProperty()
  historico: string[];

  constructor(dados: Omit<Evento, 'toJSON'>) {
    Object.assign(this, dados);
  }

  toJSON() {
    const { historico, ...publico } = this;
    return publico;
  }
}
