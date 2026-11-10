// CT03 - Buscar TCCs com filtros combinados (RF#02, UC04, US#04).
// Verifica: FR-005, FR-006, FR-007, FR-009, FR-010, FR-012; SC-001.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarAplicacao } from '../src/app.js';
import { IDS_CT03 } from '../src/repository/dadosIniciais.js';
import { MENSAGEM_NENHUM_RESULTADO } from '../src/controller/mensagens.js';

const ids = (resultado) => resultado.tccs.map((t) => t.id);

test('CT03 (FR-005, FR-006, FR-007, SC-001): Ano 2025 + Orientador "Carlos Lima" + Tag "Redes" mostra apenas o TCC A', () => {
  const { tccController } = criarAplicacao();
  const resultado = tccController.buscarTccs({ ano: 2025, orientador: 'Carlos Lima', tags: ['Redes'] });
  assert.deepEqual(ids(resultado), [IDS_CT03.A]);
  assert.equal(resultado.mensagem, null);
});

test('CT03 (FR-009): o TCC E (rascunho) não aparece mesmo atendendo a todos os filtros', () => {
  const { tccController } = criarAplicacao();
  const resultado = tccController.buscarTccs({ ano: 2025, orientador: 'Carlos Lima', tags: ['Redes'] });
  assert.ok(!ids(resultado).includes(IDS_CT03.E));
});

test('CT03 (FR-010): o item do feed traz título, autor, orientador, ano, semestre, tags e resumo', () => {
  const { tccController } = criarAplicacao();
  const [tccA] = tccController.buscarTccs({ ano: 2025, orientador: 'Carlos Lima', tags: ['Redes'] }).tccs;
  assert.equal(tccA.titulo, 'Detecção de anomalias em redes veiculares');
  assert.equal(tccA.autor, 'Mariana Souza');
  assert.equal(tccA.orientador, 'Profº Carlos Lima');
  assert.equal(tccA.ano, 2025);
  assert.equal(tccA.semestre, 1);
  assert.deepEqual(tccA.tags, ['Redes']);
  assert.equal(typeof tccA.resumoSimplificado, 'string');
  assert.ok(tccA.resumoSimplificado.length > 0);
});

test('CT03 passo 4 (FR-013): ao abrir o TCC A listado, o sistema exibe as informações preenchidas pelo autor', () => {
  const { tccController } = criarAplicacao();
  const [listado] = tccController.buscarTccs({ ano: 2025, orientador: 'Carlos Lima', tags: ['Redes'] }).tccs;
  const detalhes = tccController.visualizarDetalhes(listado.id);
  assert.equal(detalhes.id, IDS_CT03.A);
  assert.equal(detalhes.titulo, listado.titulo);
  assert.equal(detalhes.resumoSimplificado, listado.resumoSimplificado);
  assert.equal(detalhes.autor, 'Mariana Souza');
  assert.equal(detalhes.orientador, 'Profº Carlos Lima');
  assert.equal(detalhes.ano, 2025);
  assert.equal(detalhes.semestre, 1);
  assert.deepEqual(detalhes.tags, ['Redes']);
  assert.ok(detalhes.linkLume);
});

test('CT03 variação (FR-012): Ano 2023 + Tag "Redes" exibe a mensagem literal do FA01', () => {
  const { tccController } = criarAplicacao();
  const resultado = tccController.buscarTccs({ ano: 2023, tags: ['Redes'] });
  assert.deepEqual(resultado.tccs, []);
  assert.equal(resultado.mensagem, MENSAGEM_NENHUM_RESULTADO);
  assert.equal(
    resultado.mensagem,
    'Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros.',
  );
});
