#!/usr/bin/env bash
#
# verificar.sh - checagens da Trilha de Documentação de API da CJR.
# Uso: ./verificar.sh <numero-da-sessao>   (de 1 a 5)
#      ./verificar.sh --reset-nome
#
# Itens em vermelho (✗) são o que ainda falta fazer. Faça a tarefa e rode de novo.
#
set -u

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" || exit 1
NOME_FILE="$DIR/.verificar-nome"
PORTA="${VERIFICAR_PORT:-3999}"
TMP="$(mktemp -d)"
API_PID=""

verde=$'\033[32m'; verm=$'\033[31m'; amar=$'\033[33m'; neg=$'\033[1m'; z=$'\033[0m'
FALHOU=0

ok()    { printf "  ${verde}✓${z} %s\n" "$1"; }
falha() { printf "  ${verm}✗${z} %s\n" "$1"; FALHOU=1; }
dica()  { printf "      ${amar}↳${z} %s\n" "$1"; }
nota()  { printf "      ${amar}↳${z} %s\n" "$1"; }
parabens() { printf "\n${verde}${neg}🎉 Parabéns, %s!${z} %s\n" "$NOME" "$1"; }
quase()    { printf "\n${verm}%s, quase lá.${z} Os itens com ${verm}✗${z} são o que falta, faça e rode de novo.\n" "$NOME"; }
fim()      { if [ "$FALHOU" -eq 0 ]; then parabens "$1"; else quase; fi; }
banner()   { printf "%sOlá, %s! Conferindo a Sessão %s: %s.%s\n\n" "$neg" "$NOME" "$1" "$2" "$z"; FALHOU=0; }

limpar() { derrubar_api; rm -rf "$TMP"; }
trap limpar EXIT

carregar_nome() {
  [ -n "${TRILHA_NOME:-}" ] && { printf '%s' "$TRILHA_NOME"; return; }
  [ -f "$NOME_FILE" ] && { cat "$NOME_FILE"; return; }
  local n="colega"
  if [ -t 0 ]; then
    printf 'Antes de começar, como você se chama? ' >&2
    read -r n; n="${n:-colega}"
  fi
  printf '%s' "$n" > "$NOME_FILE"
  printf '%s' "$n"
}

http_status() { local c; c="$(curl -s -o /dev/null -m 5 -w '%{http_code}' "$1" 2>/dev/null)"; printf '%s' "${c:-000}"; }

# Compila a API. Sem build não há o que conferir.
buildar() {
  if [ ! -d node_modules ]; then
    falha "dependências não instaladas"; dica "rode 'npm ci' na raiz do repositório"; return 1
  fi
  if npm run build >"$TMP/build.log" 2>&1; then ok "npm run build passou"
  else falha "npm run build falhou"; dica "rode 'npm run build' para ver o erro de TypeScript"; return 1; fi
}

# Sobe dist/main.js em segundo plano. $1 = NODE_ENV.
subir_api() {
  if [ "$(http_status "http://localhost:$PORTA/")" != "000" ]; then
    falha "a porta $PORTA já está em uso"; dica "pare o que estiver rodando nela, ou use VERIFICAR_PORT=4001 ./verificar.sh <n>"; return 1
  fi
  NODE_ENV="$1" PORT="$PORTA" node dist/main.js >"$TMP/api.log" 2>&1 &
  API_PID=$!
  local i
  for i in $(seq 1 40); do
    [ "$(http_status "http://localhost:$PORTA/eventos")" = "200" ] && return 0
    kill -0 "$API_PID" 2>/dev/null || break
    sleep 0.25
  done
  falha "a API não subiu (NODE_ENV=$1)"; dica "rode 'npm run start:prod' para ver o erro"; return 1
}

derrubar_api() {
  [ -n "$API_PID" ] && { kill "$API_PID" 2>/dev/null; wait "$API_PID" 2>/dev/null; }
  API_PID=""
}

# Exporta o documento atual para $TMP/openapi.json.
exportar() {
  if EXPORT_PORT="$PORTA" node scripts/export-openapi.mjs "$TMP/openapi.json" >"$TMP/export.log" 2>&1; then
    ok "documento exportado de /api-json"
  else
    falha "não consegui exportar o documento"; dica "$(tail -1 "$TMP/export.log")"; return 1
  fi
}

# Roda as checagens do documento e imprime no formato do script.
checar_documento() {
  local linha tipo msg dicatxt
  while IFS= read -r linha; do
    tipo="${linha%%|*}"; linha="${linha#*|}"
    msg="${linha%%|*}"; dicatxt="${linha#*|}"
    if [ "$tipo" = "OK" ]; then ok "$msg"; else falha "$msg"; dica "$dicatxt"; fi
  done < <(node scripts/checar-openapi.mjs "$1" "$TMP/openapi.json" "$NOME")
}

preparar_documento() {
  buildar || return 1
  exportar || return 1
}

# --- Sessão 1 --------------------------------------------------------------
sessao1() {
  banner 1 "no ar: o contrato da API"
  preparar_documento || { fim ""; return; }
  subir_api development || { fim ""; return; }
  local code; code="$(http_status "http://localhost:$PORTA/api")"
  if [ "$code" = "200" ]; then ok "Swagger UI abre em /api"
  else falha "/api respondeu $code"; dica "SwaggerModule.setup('api', app, documento) no main.ts"; fi
  derrubar_api
  checar_documento 1
  fim "A Agenda tem contrato. Abra http://localhost:3000/api e veja quanta coisa ainda está vazia."
}

# --- Sessão 2 --------------------------------------------------------------
sessao2() {
  banner 2 "endpoints e erros"
  preparar_documento || { fim ""; return; }
  checar_documento 2
  fim "Toda rota diz o que faz, o que devolve e como falha. Falta o formato dos dados (Sessão 3)."
}

# --- Sessão 3 --------------------------------------------------------------
sessao3() {
  banner 3 "schemas: DTOs e exemplos (Checkpoint)"
  if grep -q '@nestjs/swagger' nest-cli.json 2>/dev/null; then ok "CLI plugin do @nestjs/swagger ligado no nest-cli.json"
  else falha "CLI plugin não está no nest-cli.json"; dica "adicione o plugin em compilerOptions.plugins (veja o Mão na massa)"; fi
  preparar_documento || { fim ""; return; }
  checar_documento 3
  fim "Nenhum schema vazio: quem consome sabe exatamente o formato dos dados. Checkpoint feito!"
}

# --- Sessão 4 --------------------------------------------------------------
sessao4() {
  banner 4 "o portão: lint e produção (Entrega)"
  if [ -f .spectral.yaml ] && grep -q 'spectral:oas' .spectral.yaml; then ok ".spectral.yaml estende spectral:oas"
  else falha ".spectral.yaml ausente ou sem spectral:oas"; dica "crie .spectral.yaml com: extends: [\"spectral:oas\"]"; fi
  preparar_documento || { fim ""; return; }
  cp "$TMP/openapi.json" openapi.json
  if npx --no-install spectral lint openapi.json --fail-severity=warn >"$TMP/spectral.log" 2>&1; then
    ok "Spectral sem erros nem avisos"
  else
    local n; n="$(grep -cE '^ +[0-9]+:[0-9]+ +(error|warning)' "$TMP/spectral.log")"
    if [ "$n" -gt 0 ]; then falha "Spectral encontrou ${n} problema(s) no documento"; dica "rode 'npm run docs:lint' para ver a lista"
    else falha "o Spectral não rodou"; dica "$(grep -v '^$' "$TMP/spectral.log" | tail -1)"; fi
  fi
  # Lê os workflows como YAML de verdade: um passo colado com a indentação errada
  # contém o texto "docs:lint" mas quebra o arquivo inteiro no GitHub.
  local wf
  wf="$(node -e '
    const fs = require("fs"), yaml = require("js-yaml");
    const dir = ".github/workflows";
    const arquivos = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.ya?ml$/.test(f) && f !== "entrega.yml") : [];
    let invalido = "";
    for (const f of arquivos) {
      const texto = fs.readFileSync(`${dir}/${f}`, "utf8");
      let wf;
      try { wf = yaml.load(texto); } catch (e) { if (/spectral|docs:lint/.test(texto)) invalido = `INVALIDO|${dir}/${f}|${e.reason} (linha ${e.mark.line + 1})`; continue; }
      const passos = Object.values(wf?.jobs ?? {}).flatMap((j) => j.steps ?? []);
      if (passos.some((p) => /spectral|docs:lint/.test(p.run ?? ""))) { console.log(`OK|${dir}/${f}`); process.exit(0); }
    }
    console.log(invalido);
  ' 2>/dev/null)"
  case "$wf" in
    OK\|*) ok "o lint roda no GitHub Actions (${wf#OK|})";;
    INVALIDO\|*) wf="${wf#INVALIDO|}"; falha "${wf%%|*} não é um YAML válido: ${wf#*|}"; dica "os passos '- run:' precisam da mesma indentação dos outros passos (6 espaços)";;
    *) falha "nenhum workflow roda o Spectral"; dica "adicione 'npm run docs:export' e 'npm run docs:lint' como passos do .github/workflows/ci.yml";;
  esac
  if subir_api production; then
    local api json
    api="$(http_status "http://localhost:$PORTA/api")"; json="$(http_status "http://localhost:$PORTA/api-json")"
    if [ "$api" = "404" ] && [ "$json" = "404" ]; then ok "com NODE_ENV=production, /api e /api-json respondem 404"
    else falha "com NODE_ENV=production a documentação continua aberta (/api=$api, /api-json=$json)"; dica "envolva o SwaggerModule.setup num if (process.env.NODE_ENV !== 'production')"; fi
    derrubar_api
  fi
  local slug; slug="$(git config --get remote.origin.url 2>/dev/null | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')"
  if [ -z "${CI:-}" ] && [ -n "$slug" ] && command -v gh >/dev/null 2>&1; then
    local rs cl
    rs="$(gh api "repos/${slug}/rules/branches/main" --jq '[.[] | select(.type=="required_status_checks")] | length' 2>/dev/null)"
    cl="$(gh api "repos/${slug}/branches/main/protection" --jq '(.required_status_checks.contexts // []) | length' 2>/dev/null)"
    case "$rs" in ''|*[!0-9]*) rs=0;; esac
    case "$cl" in ''|*[!0-9]*) cl=0;; esac
    if [ $(( rs + cl )) -gt 0 ]; then ok "o main exige check do CI para mergear"
    else nota "não achei proteção no main de ${slug}: confira em Settings > Rules (o vermelho precisa barrar o merge)"; fi
  fi
  fim "Documentação com portão no CI e fechada em produção. Entrega feita! 🎓"
}

# --- Sessão 5 --------------------------------------------------------------
sessao5() {
  banner 5 "consumir o contrato (opcional)"
  preparar_documento || { fim ""; return; }
  local porta_mock=$(( PORTA + 1 ))
  nota "subindo o mock do Prism (na primeira vez o npx baixa o pacote, pode levar 1 minuto)"
  npx --yes @stoplight/prism-cli@5.16.0 mock -p "$porta_mock" "$TMP/openapi.json" >"$TMP/prism.log" 2>&1 &
  local prism=$! i code="000"
  for i in $(seq 1 240); do
    code="$(http_status "http://localhost:$porta_mock/eventos")"
    [ "$code" = "200" ] && break
    kill -0 "$prism" 2>/dev/null || break
    sleep 0.5
  done
  if [ "$code" = "200" ]; then ok "o mock do Prism responde GET /eventos com 200, sem a API rodando"
  else falha "o mock do Prism não respondeu (GET /eventos = $code)"; dica "rode 'npx @stoplight/prism-cli mock openapi.json' e veja o erro"; fi
  code="$(curl -s -o /dev/null -m 5 -w '%{http_code}' -X POST "http://localhost:$porta_mock/eventos" -H 'Content-Type: application/json' -d '{}' 2>/dev/null)"
  # O Prism devolve o erro documentado no POST (400); sem ele, gera um 422 próprio.
  if [ "$code" = "400" ] || [ "$code" = "422" ]; then ok "o mock recusa um POST sem titulo e inicio ($code), só lendo o contrato"
  else falha "o POST vazio no mock respondeu ${code:-000} (esperava 400)"; dica "confira o required do CreateEventoDto (Sessão 3)"; fi
  kill "$prism" 2>/dev/null; wait "$prism" 2>/dev/null
  fim "Você consumiu o contrato antes da API. Daqui pra frente é escolher o próximo passo."
}

# --- entrada ---------------------------------------------------------------
case "${1:-}" in
  --reset-nome|--reset) rm -f "$NOME_FILE"; echo "Pronto, esqueci seu nome."; exit 0;;
  ""|-h|--help)
    echo "Uso: ./verificar.sh <numero-da-sessao>   (de 1 a 5)"
    echo "     ./verificar.sh --reset-nome"
    exit 0;;
esac

NOME="$(carregar_nome)"

case "$1" in
  1) sessao1;;
  2) sessao2;;
  3) sessao3;;
  4) sessao4;;
  5) sessao5;;
  *) echo "Sessão inválida: ${1}. Use um número de 1 a 5."; exit 1;;
esac

exit "$FALHOU"
