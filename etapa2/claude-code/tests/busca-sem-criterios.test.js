// Pesquisa sem termo e sem filtros; ordem do feed.
// Verifica: FR-011 (Esclarecimentos P5), FR-009, FR-010 (ordem, premissa da spec); SC-008.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarAplicacao } from '../src/app.js';
import { IDS_CT03 } from '../src/repository/dadosIniciais.js';
import { MENSAGEM_NENHUM_RESULTADO } from '../src/controller/mensagens.js';
import { FiltroBusca } from '../src/dto/FiltroBusca.js';
import { StatusTcc } from '../src/model/StatusTcc.js';
import { criarTcc, criarBase } from './apoio/fabricas.js';

const idsOrdenados = (resultado) => resultado.tccs.map((t) => t.id).sort((a, b) => a - b);
const PUBLICADOS_CT03 = [IDS_CT03.A, IDS_CT03.B, IDS_CT03.C, IDS_CT03.D];

test('FR-011 (SC-008): pesquisa sem critérios lista A, B, C e D, sem o rascunho E', () => {
  const { tccController } = criarAplicacao();
  assert.deepEqual(idsOrdenados(tccController.buscarTccs({})), PUBLICADOS_CT03);
  assert.deepEqual(idsOrdenados(tccController.buscarTccs(new FiltroBusca())), PUBLICADOS_CT03);
  assert.deepEqual(idsOrdenados(tccController.buscarTccs()), PUBLICADOS_CT03);
  assert.equal(tccController.buscarTccs({}).mensagem, null);
});

test('FR-011: critérios em branco (termo só com espaços, lista de tags vazia) contam como ausentes', () => {
  const { tccController } = criarAplicacao();
  const resultado = tccController.buscarTccs({ termo: '   ', autor: '', tags: [] });
  assert.deepEqual(idsOrdenados(resultado), PUBLICADOS_CT03);
});

test('FR-010: o feed é ordenado por ano/semestre decrescente e, no empate, por título', () => {
  const { tccController } = criarAplicacao();
  const ordem = tccController.buscarTccs({}).tccs.map((t) => t.id);
  // 2025/1: "Aprendizado..." (B), "Detecção..." (A), "Protocolos..." (D); depois 2024/2 (C).
  assert.deepEqual(ordem, [IDS_CT03.B, IDS_CT03.A, IDS_CT03.D, IDS_CT03.C]);
});

test('FR-010: no mesmo ano, o segundo semestre vem antes do primeiro', () => {
  const base = criarBase([
    criarTcc({ id: 1, titulo: 'A', ano: 2025, semestre: 1 }),
    criarTcc({ id: 2, titulo: 'B', ano: 2025, semestre: 2 }),
    criarTcc({ id: 3, titulo: 'C', ano: 2026, semestre: 1 }),
  ]);
  const { tccController } = criarAplicacao({ dadosIniciais: base });
  assert.deepEqual(tccController.buscarTccs({}).tccs.map((t) => t.id), [3, 2, 1]);
});

test('FR-011, FR-012: sem nenhum TCC publicado, a pesquisa sem critérios exibe a mensagem do FA01', () => {
  const base = criarBase([criarTcc({ id: 1, status: StatusTcc.RASCUNHO })]);
  const { tccController } = criarAplicacao({ dadosIniciais: base });
  const resultado = tccController.buscarTccs({});
  assert.deepEqual(resultado.tccs, []);
  assert.equal(resultado.mensagem, MENSAGEM_NENHUM_RESULTADO);
});
