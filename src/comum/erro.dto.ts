// Formato de erro que o Nest devolve em toda a API
// (ex.: { "statusCode": 404, "message": "...", "error": "Not Found" }).
export class ErroDto {
  statusCode: number;
  message: string | string[];
  error: string;
}
