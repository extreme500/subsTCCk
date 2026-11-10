// Acesso de qualquer leitor, sem autenticação, e operações somente leitura.
// Verifica: FR-001, FR-002; SC-006.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarAplicacao } from '../src/app.js';
import { fotografarRepositorio } from './apoio/fabricas.js';

test('FR-001: a busca funciona sem nenhum dado de usuário ou credencial (visitante)', () => {
  const { tccController } = criarAplicacao();
  const resultado = tccController.buscarTccs({ tags: ['Redes'] });
  assert.ok(resultado.tccs.length > 0);
});

test('FR-002: buscar e alterar os DTOs devolvidos não altera os dados dos TCCs', () => {
  const { tccController, tccRepository } = criarAplicacao();
  const antes = fotografarRepositorio(tccRepository);
  const resultado = tccController.buscarTccs({});
  for (const dto of resultado.tccs) {
    dto.titulo = 'alterado';
    dto.tags.push('Intrusa');
  }
  resultado.filtro.termo = 'alterado';
  assert.equal(fotografarRepositorio(tccRepository), antes);
});

test('FR-001: os detalhes funcionam sem nenhum dado de usuário ou credencial (visitante)', () => {
  const { tccController } = criarAplicacao();
  assert.equal(tccController.visualizarDetalhes(1).id, 1);
});

test('FR-002: ver detalhes e alterar o DTO devolvido não altera os dados dos TCCs', () => {
  const { tccController, tccRepository } = criarAplicacao();
  const antes = fotografarRepositorio(tccRepository);
  const dto = tccController.visualizarDetalhes(1);
  dto.titulo = 'alterado';
  dto.tags.push('Intrusa');
  dto.imagens[0].descricao = 'alterada';
  assert.equal(fotografarRepositorio(tccRepository), antes);
});

test('FR-001, FR-002 (SC-006): um visitante completa buscar → ver detalhes → baixar sem login e sem alterar dados', async () => {
  const { tccController, tccRepository } = criarAplicacao();
  const antes = fotografarRepositorio(tccRepository);

  const [primeiro] = tccController.buscarTccs({ termo: 'redes veiculares' }).tccs;
  const detalhes = tccController.visualizarDetalhes(primeiro.id);
  assert.equal(detalhes.arquivoDisponivel, true);
  const resposta = await tccController.baixarArquivo(detalhes.id);

  assert.equal(resposta.sucesso, true);
  assert.ok(resposta.arquivo.size > 0);
  assert.equal(fotografarRepositorio(tccRepository), antes);
});
