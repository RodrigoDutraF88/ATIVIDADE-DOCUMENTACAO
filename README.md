# Atividade Documentação de API

Este repositório é a **Agenda**, uma API de eventos em NestJS, usada como atividade da trilha de Documentação de API da CJR. O objetivo é aprender a documentar uma API com OpenAPI a partir do próprio código: rotas, respostas, erros, schemas e segurança, com a qualidade travada no CI e a documentação fechada em produção. O código da Agenda já vem pronto e **sem nenhuma anotação de documentação**. Ao longo das sessões você escreve só a documentação.

O conteúdo de cada sessão está no Notion: [Trilha de Documentação de API](https://app.notion.com/p/3f9f0d89941780e081a1ce5a9e0df560)

## Pré-requisitos

- Node 20.11 ou superior e git
- Conta no GitHub
- Um terminal com bash (no Windows, use WSL ou Git Bash)
- Opcional: [GitHub CLI](https://cli.github.com) (`gh auth login`), para o `verificar.sh 4` conferir a proteção do branch

Não precisa de banco, Docker nem conta em outra plataforma: a Agenda guarda os eventos em memória.

## Como usar

Faça um fork pelo GitHub (botão Fork, no canto superior direito) e clone o SEU fork. No fork, abra a aba **Actions** e clique em *"I understand my workflows, go ahead and enable them"*, senão o CI não roda.

```bash
npm ci
npm run start:dev     # http://localhost:3000/eventos
```

Trabalhe sempre na raiz. Os arquivos que você vai mexer são `src/main.ts`, os controllers, os DTOs, o `nest-cli.json`, o `.spectral.yaml` (você cria) e o `.github/workflows/ci.yml`. A lógica da API (`*.service.ts`, `admin.guard.ts`) não muda.

## Rotas da Agenda

| Rota | O que faz |
|------|-----------|
| `GET /eventos?de=2026-11-01` | Lista os eventos, com filtro opcional por data |
| `GET /eventos/:id` | Busca um evento |
| `POST /eventos` | Cria um evento |
| `PATCH /eventos/:id` | Edita um evento |
| `DELETE /eventos/:id` | Remove um evento |
| `GET /admin/estatisticas` | Estatísticas, exige `Authorization: Bearer trilha-docs` |

## Sessões

| Sessão | Entrega |
|--------|---------|
| 1 | Documentação no ar em `/api` e `/api-json`, com o seu nome no título |
| 2 | Toda rota com tag, resumo, resposta de sucesso tipada, erro documentado e bearer na rota de admin |
| 3 (checkpoint) | Nenhum schema vazio: CLI plugin ligado, DTOs com exemplo, `UpdateEventoDto` correto |
| 4 (entrega) | Spectral sem avisos no CI, branch protegido e documentação fechada em produção |
| 5 (opcional) | Mock do contrato com Prism, escolha de UI e versionamento |

As sessões 1 a 4 já cobrem o necessário para documentar uma API de projeto da CJR. As sessões 1 e 4 servem para qualquer stack; as sessões 2 e 3 são específicas do NestJS.

## Verificação

```bash
./verificar.sh <numero-da-sessao>
```

O número vai de 1 a 5. Na primeira vez o script pergunta o seu nome. Ele compila a API, sobe numa porta separada (3999), exporta o documento OpenAPI e confere critérios objetivos. Cada checagem aparece em verde quando está certa e em vermelho quando falta algo, com uma linha do que ajustar. Sai com código 0 se tudo passou e 1 caso contrário.

- `VERIFICAR_PORT=4001 ./verificar.sh <n>`: usa outra porta, se a 3999 estiver ocupada
- `./verificar.sh --reset-nome`: esquece o nome salvo

Scripts úteis:

- `npm run docs:export`: compila e salva o documento em `openapi.json`
- `npm run docs:lint`: roda o Spectral no `openapi.json` (precisa do `.spectral.yaml`, Sessão 4)

## Entrega

Com o `./verificar.sh 4` passando, abra um pull request do seu fork para este repositório (base: `main`) a partir de um branch `entrega/seu-nome`. O workflow `entrega` roda as checagens das sessões 2, 3 e 4. Alguém do núcleo revisa e comenta. PR aprovado fecha a trilha e emite o certificado.

## Gabarito e erros comuns

A pasta `gabarito/` tem a versão de referência de tudo (`src/`, `nest-cli.json`, `.spectral.yaml` e `ci.yml`). Consulte só depois de tentar por conta própria.

Travou? Veja o [ERROS.md](ERROS.md).
