// Checagens objetivas do documento OpenAPI, usadas pelo verificar.sh.
// Uso: node scripts/checar-openapi.mjs <sessao> <openapi.json> [nome]
// Imprime uma linha por checagem: "OK|mensagem" ou "FALHA|mensagem|dica".
import { readFileSync } from 'node:fs';

const [sessao, arquivo, nome = ''] = process.argv.slice(2);
const doc = JSON.parse(readFileSync(arquivo, 'utf8'));
const METODOS = ['get', 'post', 'put', 'patch', 'delete'];

const ok = (msg) => console.log(`OK|${msg}`);
const falha = (msg, dica) => console.log(`FALHA|${msg}|${dica}`);
const lista = (itens) => (itens.length > 3 ? `${itens.slice(0, 3).join(', ')} e mais ${itens.length - 3}` : itens.join(', '));
const checar = (problemas, msgOk, msgFalha, dica) =>
  problemas.length === 0 ? ok(msgOk) : falha(`${msgFalha}: ${lista(problemas)}`, dica);

const operacoes = Object.entries(doc.paths ?? {}).flatMap(([caminho, item]) =>
  METODOS.filter((m) => item[m]).map((m) => ({ id: `${m.toUpperCase()} ${caminho}`, caminho, metodo: m, op: item[m] })),
);
const schemas = doc.components?.schemas ?? {};
const nomeSchema = (ref) => ref?.split('/').pop();

function sessao1() {
  ok(`documento OpenAPI ${doc.openapi} gerado pelo @nestjs/swagger`);
  const titulo = doc.info?.title ?? '';
  if (nome && titulo.toLowerCase().includes(nome.toLowerCase())) ok(`título com o seu nome: "${titulo}"`);
  else falha(`o título "${titulo}" não tem o seu nome (${nome})`, `no DocumentBuilder: .setTitle('Agenda de ${nome || 'SEU NOME'}')`);
  if (doc.info?.version) ok(`versão da API preenchida (info.version = ${doc.info.version})`);
  else falha('info.version vazio', "no DocumentBuilder: .setVersion('1.0.0')");
  if (operacoes.length >= 4) ok(`${operacoes.length} rotas aparecem no documento`);
  else falha(`só ${operacoes.length} rotas no documento (esperava 4)`, 'confira se o SwaggerModule.setup roda antes do app.listen');
}

function sessao2() {
  checar(operacoes.filter((o) => !o.op.tags?.length).map((o) => o.id), 'toda rota tem tag', 'rotas sem tag', "use @ApiTags('eventos') e @ApiTags('admin') nos controllers");
  checar(operacoes.filter((o) => !o.op.summary?.trim()).map((o) => o.id), 'toda rota tem resumo', 'rotas sem resumo', "use @ApiOperation({ summary: '...' }) em cada método");
  const sucessos = (o) => Object.keys(o.op.responses ?? {}).filter((c) => c.startsWith('2'));
  checar(operacoes.filter((o) => sucessos(o).length === 0).map((o) => o.id), 'toda rota tem resposta de sucesso', 'rotas sem resposta 2xx', 'use @ApiOkResponse ou @ApiCreatedResponse');
  const semCorpo = operacoes.filter((o) => sucessos(o).some((c) => c !== '204' && !o.op.responses[c].content));
  checar(semCorpo.map((o) => o.id), 'respostas de sucesso dizem o tipo devolvido', 'sucesso sem tipo', 'passe o tipo: @ApiOkResponse({ type: Evento }) ou { type: [Evento] } para listas');
  // Cada rota documenta o erro que ela lança de verdade (veja o eventos.service.ts e o admin.guard.ts).
  const ERROS_ESPERADOS = { 'POST /eventos': '400', 'PATCH /eventos/{id}': '404', 'GET /admin/estatisticas': '401' };
  const faltando = Object.entries(ERROS_ESPERADOS)
    .filter(([id, codigo]) => !operacoes.find((o) => o.id === id)?.op.responses?.[codigo])
    .map(([id, codigo]) => `${id} (${codigo})`);
  checar(faltando, 'cada rota documenta o erro que pode devolver', 'erro não documentado', 'POST: @ApiBadRequestResponse, PATCH: @ApiNotFoundResponse, admin: @ApiUnauthorizedResponse, todos com { type: ErroDto }');
  const bearer = Object.entries(doc.components?.securitySchemes ?? {}).find(([, s]) => s.type === 'http' && s.scheme === 'bearer');
  if (bearer) ok('esquema de segurança bearer declarado');
  else falha('nenhum esquema bearer no documento', 'no DocumentBuilder: .addBearerAuth()');
  const admin = operacoes.filter((o) => o.caminho.startsWith('/admin'));
  const desprotegidas = admin.filter((o) => !(o.op.security ?? doc.security ?? []).some((s) => bearer && bearer[0] in s));
  if (admin.length && desprotegidas.length === 0) ok('rotas de admin marcadas como protegidas por bearer');
  else falha('rota de admin sem cadeado no documento', 'use @ApiBearerAuth() no AdminController');
}

function sessao3() {
  const nomes = Object.keys(schemas);
  if (nomes.length) ok(`${nomes.length} schemas no documento`);
  else falha('nenhum schema em components.schemas', 'termine a Sessão 2: os tipos nas respostas criam os schemas');
  // UpdateEventoDto vazio tem causa própria (o import do PartialType) e checagem própria abaixo.
  const vazios = nomes.filter((n) => n !== 'UpdateEventoDto' && !Object.keys(schemas[n].properties ?? {}).length);
  checar(vazios, 'nenhum schema vazio', 'schemas vazios', 'ative o CLI plugin no nest-cli.json e rode o build de novo');
  const vagos = [];
  for (const [n, s] of Object.entries(schemas)) {
    for (const [campo, p] of Object.entries(s.properties ?? {})) {
      const temTipo = p.$ref || p.oneOf || p.anyOf || p.allOf || p.enum || p.type;
      const objetoVazio = p.type === 'object' && !p.properties && !p.additionalProperties;
      if (!temTipo || objetoVazio) vagos.push(`${n}.${campo}`);
    }
  }
  checar(vagos, 'todo campo tem um tipo concreto', 'campos sem tipo ou com "object" genérico', 'anote à mão com @ApiProperty, ex.: oneOf para string | string[]');
  const criar = schemas.CreateEventoDto?.properties ?? {};
  const semExemplo = Object.keys(criar).filter((c) => criar[c].example === undefined);
  if (!Object.keys(criar).length) falha('CreateEventoDto sem propriedades', 'documente o DTO com @ApiProperty');
  else checar(semExemplo.map((c) => `CreateEventoDto.${c}`), 'CreateEventoDto tem exemplo em todos os campos', 'campos de entrada sem exemplo', "@ApiProperty({ example: '...' }) ou /** @example ... */ com introspectComments");
  const corpo = doc.paths?.['/eventos/{id}']?.patch?.requestBody?.content?.['application/json']?.schema?.$ref;
  if (nomeSchema(corpo) === 'UpdateEventoDto' && Object.keys(schemas.UpdateEventoDto?.properties ?? {}).length) ok('PATCH usa UpdateEventoDto com propriedades');
  else falha('UpdateEventoDto vazio no PATCH', 'importe PartialType de @nestjs/swagger, não de @nestjs/mapped-types');
  const evento = schemas.Evento?.properties ?? {};
  if ('historico' in evento) falha('Evento expõe o campo interno historico', 'use @ApiHideProperty() no historico');
  else if (Object.keys(evento).length) ok('campo interno historico fora da documentação');
}

({ 1: sessao1, 2: sessao2, 3: sessao3 })[sessao]?.();
