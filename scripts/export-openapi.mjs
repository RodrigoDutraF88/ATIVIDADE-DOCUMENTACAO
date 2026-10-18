// Sobe a API compilada (dist/main.js), baixa o /api-json e salva em openapi.json.
// Uso: node scripts/export-openapi.mjs [arquivo-de-saida]
// Rode depois do build (npm run docs:export já faz os dois).
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';

const saida = process.argv[2] ?? 'openapi.json';
const porta = process.env.EXPORT_PORT ?? '3998';

if (!existsSync('dist/main.js')) {
  console.error('Não achei dist/main.js. Rode npm run build antes.');
  process.exit(1);
}

const api = spawn(process.execPath, ['dist/main.js'], {
  env: { ...process.env, PORT: porta, NODE_ENV: 'development' },
  stdio: ['ignore', 'ignore', 'inherit'],
});
let saiu = false;
const encerrou = new Promise((r) => api.on('exit', () => r((saiu = true))));

async function baixar() {
  for (let tentativa = 0; tentativa < 40 && !saiu; tentativa++) {
    try {
      const resposta = await fetch(`http://localhost:${porta}/api-json`);
      if (resposta.status === 404) return { erro: 'o /api-json respondeu 404. Configure o Swagger no main.ts (Sessão 1).' };
      if (resposta.ok) return { documento: await resposta.json() };
    } catch {
      // a API ainda está subindo
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return { erro: saiu ? `a API não subiu. A porta ${porta} está livre? Rode npm run start:prod e veja o erro.` : 'a API não respondeu a tempo.' };
}

const { documento, erro } = await baixar();
api.kill();
await encerrou; // libera a porta antes de sair
if (erro) {
  console.error(`Falha ao exportar: ${erro}`);
  process.exit(1);
}
writeFileSync(saida, JSON.stringify(documento, null, 2) + '\n');
console.log(`Documento OpenAPI ${documento.openapi} salvo em ${saida}.`);
