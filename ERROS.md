# Erros comuns

Problemas que já apareceram ao fazer a trilha, com a causa e o que fazer.

## Sessão 1

**`Falha ao exportar: o /api-json respondeu 404`**
O Swagger ainda não está configurado, ou o `SwaggerModule.setup` está depois do `app.listen`. Ele precisa vir antes.

**`a porta 3999 já está em uso`**
Tem outra coisa (talvez um `npm run start:dev` esquecido) rodando nela. Pare o processo ou rode `VERIFICAR_PORT=4001 ./verificar.sh <n>`.

**`o título "..." não tem o seu nome`**
O script compara com o nome que você digitou na primeira vez. Se digitou errado, rode `./verificar.sh --reset-nome`.

## Sessão 2

**`toda rota tem tag` passou sem eu usar `@ApiTags`**
Normal. O `@nestjs/swagger` 11 cria a tag a partir do nome do controller (`Eventos`, `Admin`). Use `@ApiTags('eventos')` mesmo assim, para escolher o nome. Ele precisa bater com o `addTag` da Sessão 4.

**`o filtro ?de= de GET /eventos aparece como obrigatório`**
Todo `@Query('nome')` sai como obrigatório no documento, mesmo com `?` no TypeScript. Use `@ApiQuery({ name: 'de', required: false })`.

**`sucesso sem tipo`**
`@ApiOkResponse()` sem `type` gera uma resposta sem corpo. Passe `{ type: Evento }`, ou `{ type: [Evento] }` para listas.

## Sessão 3

**Schemas continuam vazios com o plugin ligado**
O plugin roda só na compilação do Nest CLI (`npm run build`, `npm run start:dev`). Rodando por `ts-node`, `tsc` direto ou outro runner, ele não age e não avisa nada. O plugin também só lê arquivos que terminam em `.dto.ts` ou `.entity.ts`.

**`UpdateEventoDto vazio no PATCH`**
O `PartialType` foi importado de `@nestjs/mapped-types`. Essa versão serve para validação, mas não carrega os metadados da documentação. Importe de `@nestjs/swagger`.

**`campos sem tipo ou com "object" genérico: ErroDto.message`**
O plugin não entende tipos união como `string | string[]` e gera `type: object`. Anote à mão com `@ApiProperty({ oneOf: [...] })`.

**`Evento expõe o campo interno historico`**
O plugin documenta todo campo da classe, inclusive os que a API nunca devolve. Use `@ApiHideProperty()`.

## Sessão 4

**`o Spectral não rodou` / `No ruleset has been found`**
Falta o `.spectral.yaml` na raiz, com `extends: ["spectral:oas"]`.

**`operation-tag-defined: Operation tags must be defined in global tags`**
Cada tag usada nas rotas precisa ser declarada no `DocumentBuilder` com `.addTag('eventos', 'descrição')`. O nome diferencia maiúsculas: `Eventos` não é `eventos`.

**`info-description` e `oas3-api-servers`**
Faltam `.setDescription('...')` e `.addServer('http://localhost:3000')` no `DocumentBuilder`.

**`operation-description`**
Toda operação precisa de `description`, além do `summary`: `@ApiOperation({ summary: '...', description: '...' })`.

**O CI falha no `npm ci`**
O `package-lock.json` ficou desatualizado (instalou algo com `npm install` e não commitou o lock). Rode `npm install`, commite o `package-lock.json` e dê push.

**`com NODE_ENV=production a documentação continua aberta`**
Envolva o `createDocument` e o `SwaggerModule.setup` num `if (process.env.NODE_ENV !== 'production')`.

## Sessão 5

**O mock do Prism demora para subir**
Na primeira vez o `npx` baixa o Prism, que pode levar mais de 1 minuto. As próximas são rápidas.
