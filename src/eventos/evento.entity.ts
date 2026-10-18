export class Evento {
  id: string;
  titulo: string;
  inicio: string;
  fim: string | null;
  local: string | null;
  criadoEm: string;

  // Uso interno: datas de cada alteração, usadas nas estatísticas do admin.
  // Nunca sai nas respostas (veja o toJSON abaixo).
  historico: string[];

  constructor(dados: Omit<Evento, 'toJSON'>) {
    Object.assign(this, dados);
  }

  toJSON() {
    const { historico, ...publico } = this;
    return publico;
  }
}
