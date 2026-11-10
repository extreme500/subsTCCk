// Termo livre e filtros de autor/orientador.
// Verifica: FR-004 (Esclarecimentos P2), FR-007; US#04 cenário 3; História 1 cenário 10.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarAplicacao } from '../src/app.js';
import { IDS_CT03 } from '../src/repository/dadosIniciais.js';
import { criarTcc, criarBase } from './apoio/fabricas.js';

const idsOrdenados = (resultado) => resultado.tccs.map((t) => t.id).sort((a, b) => a - b);

test('FR-004 (US#04 cenário 3): digitar "Carlos Lima" na barra mostra somente os trabalhos publicados desse orientador', () => {
  const { tccController } = criarAplicacao();
  const resultado = tccController.buscarTccs({ termo: 'Carlos Lima' });
  assert.deepEqual(idsOrdenados(resultado), [IDS_CT03.A, IDS_CT03.B, IDS_CT03.C]);
});

test('FR-004 (cenário 10): "seguranca" encontra o TCC cujo resumo contém "Segurança"', () => {
  const base = criarBase([
    criarTcc({ id: 1, titulo: 'Um estudo', resumoSimplificado: 'Segurança em aplicações web.' }),
    criarTcc({ id: 2, titulo: 'Outro estudo', resumoSimplificado: 'Desempenho de bancos de dados.' }),
  ]);
  const { tccController } = criarAplicacao({ dadosIniciais: base });
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ termo: 'seguranca' })), [1]);
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ termo: 'SEGURANÇA' })), [1]);
});

test('FR-004: o termo pode ser parte de uma palavra e não diferencia maiúsculas/minúsculas', () => {
  const { tccController } = criarAplicacao();
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ termo: 'anomal' })), [IDS_CT03.A]);
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ termo: 'VEICULARES' })), [IDS_CT03.A]);
});

test('FR-004: o termo é procurado no nome das tags', () => {
  const base = criarBase([
    criarTcc({ id: 1, titulo: 'Um estudo', resumoSimplificado: 'Texto neutro.', tags: ['Criptografia'] }),
    criarTcc({ id: 2, titulo: 'Outro estudo', resumoSimplificado: 'Texto neutro.', tags: ['Redes'] }),
  ]);
  const { tccController } = criarAplicacao({ dadosIniciais: base });
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ termo: 'criptografia' })), [1]);
});

test('FR-004: o termo é procurado no nome do autor', () => {
  const { tccController } = criarAplicacao();
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ termo: 'mariana' })), [IDS_CT03.A]);
});

test('FR-004: o termo não é procurado no nome do coorientador (premissa da spec)', () => {
  const base = criarBase([
    criarTcc({ id: 1, titulo: 'Um estudo', orientador: 'Profº Paulo Dias', coorientador: 'Profª Beatriz Nunes' }),
  ]);
  const { tccController } = criarAplicacao({ dadosIniciais: base });
  assert.deepEqual(tccController.buscarTccs({ termo: 'Beatriz' }).tccs, []);
});

test('FR-007: o filtro de autor aceita parte do nome, sem diferenciar maiúsculas/minúsculas', () => {
  const { tccController } = criarAplicacao();
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ autor: 'mariana' })), [IDS_CT03.A]);
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ autor: 'SOUZA' })), [IDS_CT03.A]);
});

test('FR-007: o filtro de orientador aceita parte do nome, sem diferenciar maiúsculas/minúsculas', () => {
  const { tccController } = criarAplicacao();
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ orientador: 'ana reis' })), [IDS_CT03.D]);
});

test('FR-007: o filtro de orientador não considera o coorientador (premissa da spec)', () => {
  const base = criarBase([
    criarTcc({ id: 1, orientador: 'Profº Paulo Dias', coorientador: 'Profª Beatriz Nunes' }),
  ]);
  const { tccController } = criarAplicacao({ dadosIniciais: base });
  assert.deepEqual(tccController.buscarTccs({ orientador: 'Beatriz' }).tccs, []);
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({ orientador: 'Paulo' })), [1]);
});
