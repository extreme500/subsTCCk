// Filtros de tags, coleção e ano; combinação de todos os critérios.
// Verifica: FR-003, FR-003a (Esclarecimentos P1), FR-005, FR-006, FR-008 (Esclarecimentos P3); SC-005.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarAplicacao } from '../src/app.js';
import { IDS_CT03 } from '../src/repository/dadosIniciais.js';
import { MENSAGEM_NENHUM_RESULTADO } from '../src/controller/mensagens.js';
import { FiltroBusca, FiltroInvalidoError } from '../src/dto/FiltroBusca.js';
import { criarTcc, criarBase } from './apoio/fabricas.js';

const idsOrdenados = (resultado) => resultado.tccs.map((t) => t.id).sort((a, b) => a - b);

function baseTags() {
  return criarBase([
    criarTcc({ id: 1, tags: ['Redes', 'IA'] }),
    criarTcc({ id: 2, tags: ['Redes'] }),
  ]);
}

test('FR-008 (cenário 9): com as tags "Redes" e "IA" aparece somente o TCC que tem as duas', () => {
  const { tccController } = criarAplicacao({ dadosIniciais: baseTags() });
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ tags: ['Redes', 'IA'] })), [1]);
});

test('FR-008: as tags são comparadas sem diferenciar maiúsculas/minúsculas', () => {
  const { tccController } = criarAplicacao({ dadosIniciais: baseTags() });
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ tags: ['redes', 'ia'] })), [1]);
});

test('FR-008: tag é comparada pelo nome inteiro ("Rede" não equivale a "Redes")', () => {
  const { tccController } = criarAplicacao({ dadosIniciais: baseTags() });
  assert.deepEqual(tccController.buscarTccs({ tags: ['Rede'] }).tccs, []);
});

test('FR-008, FR-012: se nenhum TCC tem todas as tags, o feed fica vazio com a mensagem do FA01', () => {
  const { tccController } = criarAplicacao({ dadosIniciais: baseTags() });
  const resultado = tccController.buscarTccs({ tags: ['Redes', 'Robótica'] });
  assert.deepEqual(resultado.tccs, []);
  assert.equal(resultado.mensagem, MENSAGEM_NENHUM_RESULTADO);
});

test('FR-008: o filtro de tags aceita uma única tag informada como texto', () => {
  const { tccController } = criarAplicacao({ dadosIniciais: baseTags() });
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ tags: 'IA' })), [1]);
});

test('FR-003a (cenário 7): a coleção "Ciência da Computação" esconde os trabalhos de outro curso', () => {
  const base = criarBase([
    criarTcc({ id: 1, colecao: 'Ciência da Computação' }),
    criarTcc({ id: 2, colecao: 'Engenharia de Computação' }),
  ]);
  const { tccController } = criarAplicacao({ dadosIniciais: base });
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ colecao: 'Ciência da Computação' })), [1]);
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ colecao: 'ciencia da computacao' })), [1]);
});

test('FR-003a: TCC sem curso de origem não atende ao filtro de coleção, mas aparece sem esse filtro (premissa da spec)', () => {
  const base = criarBase([criarTcc({ id: 1, colecao: null })]);
  const { tccController } = criarAplicacao({ dadosIniciais: base });
  assert.deepEqual(tccController.buscarTccs({ colecao: 'Ciência da Computação' }).tccs, []);
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({})), [1]);
});

test('FR-006: o filtro de ano seleciona TCCs dos dois semestres do ano', () => {
  const base = criarBase([
    criarTcc({ id: 1, ano: 2025, semestre: 1 }),
    criarTcc({ id: 2, ano: 2025, semestre: 2 }),
    criarTcc({ id: 3, ano: 2024, semestre: 2 }),
  ]);
  const { tccController } = criarAplicacao({ dadosIniciais: base });
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ ano: 2025 })), [1, 2]);
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ ano: '2025' })), [1, 2]);
});

test('FR-003, FR-005 (SC-005): termo e os cinco filtros combinados numa única pesquisa', () => {
  const { tccController } = criarAplicacao();
  const resultado = tccController.buscarTccs({
    termo: 'anomalias',
    ano: 2025,
    autor: 'Mariana',
    orientador: 'Carlos Lima',
    tags: ['Redes'],
    colecao: 'Ciência da Computação',
  });
  assert.deepEqual(idsOrdenados(resultado), [IDS_CT03.A]);
});

test('FR-003: o controller aceita uma instância de FiltroBusca', () => {
  const { tccController } = criarAplicacao();
  const resultado = tccController.buscarTccs(new FiltroBusca({ tags: ['IA'] }));
  assert.deepEqual(idsOrdenados(resultado), [IDS_CT03.B]);
});

test('FR-003: ano que não é inteiro lança FiltroInvalidoError', () => {
  const { tccController } = criarAplicacao();
  assert.throws(() => tccController.buscarTccs({ ano: 'abc' }), FiltroInvalidoError);
  assert.throws(() => tccController.buscarTccs({ ano: 2025.5 }), FiltroInvalidoError);
});
