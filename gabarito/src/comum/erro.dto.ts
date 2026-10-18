import { ApiProperty } from '@nestjs/swagger';

// Formato de erro que o Nest devolve em toda a API
// (ex.: { "statusCode": 404, "message": "...", "error": "Not Found" }).
export class ErroDto {
  /** @example 404 */
  statusCode: number;

  // O plugin não entende "string | string[]" e gera type: object. Aqui vai à mão.
  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'evento seed-x não encontrado',
  })
  message: string | string[];

  /** @example "Not Found" */
  error: string;
}
