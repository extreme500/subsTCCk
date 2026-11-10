// CT05 - Buscar TCCs sem correspondência (RF#02, UC04 FA01, US#04).
// Verifica: FR-004, FR-005, FR-009, FR-012; SC-002, SC-003.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarAplicacao } from '../src/app.js';
import { IDS_CT03 } from '../src/repository/dadosIniciais.js';
import { MENSAGEM_NENHUM_RESULTADO } from '../src/controller/mensagens.js';

const idsOrdenados = (resultado) => resultado.tccs.map((t) => t.id).sort((a, b) => a - b);

test('CT05 passo 3 (FR-004, FR-005, FR-012): "blockchain" + Tag "Redes" deixa o feed vazio com a mensagem do FA01', () => {
  const { tccController } = criarAplicacao();
  const resultado = tccController.buscarTccs({ termo: 'blockchain', tags: ['Redes'] });
  assert.deepEqual(resultado.tccs, []);
  assert.equal(resultado.mensagem, MENSAGEM_NENHUM_RESULTADO);
});

test('CT05 passo 4 (FR-012, FR-009, SC-003): removendo o termo e mantendo Tag "Redes", o feed mostra A, C e D, sem E', () => {
  const { tccController } = criarAplicacao();
  const vazio = tccController.buscarTccs({ termo: 'blockchain', tags: ['Redes'] });
  // FR-012: os critérios informados voltam no resultado e são reaproveitados.
  assert.equal(vazio.filtro.termo, 'blockchain');
  assert.deepEqual(vazio.filtro.tags, ['Redes']);
  const resultado = tccController.buscarTccs({ ...vazio.filtro, termo: null });
  assert.deepEqual(idsOrdenados(resultado), [IDS_CT03.A, IDS_CT03.C, IDS_CT03.D]);
  assert.equal(resultado.mensagem, null);
});

test('CT05 variação (FR-009, SC-002): buscar pelo título do TCC E (rascunho) exibe a mensagem do FA01', () => {
  const { tccController } = criarAplicacao();
  const resultado = tccController.buscarTccs({ termo: 'Monitoramento de tráfego em redes 5G' });
  assert.deepEqual(resultado.tccs, []);
  assert.equal(resultado.mensagem, MENSAGEM_NENHUM_RESULTADO);
});
