// Detalhes de um TCC (UC04 passos 6-7; US#04 cenário 1).
// Verifica: FR-013, FR-014, FR-015a; SC-007.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarAplicacao } from '../src/app.js';
import { IDS_CT03, criarDadosIniciais } from '../src/repository/dadosIniciais.js';
import { TccNaoEncontradoError, ArquivoIndisponivelError } from '../src/service/erros.js';
import { criarTcc, criarBase } from './apoio/fabricas.js';

// ---------- Visualização (História 2) ----------

test('FR-013: os detalhes do TCC A trazem todos os dados preenchidos pelo autor', () => {
  const { tccController } = criarAplicacao();
  const tcc = tccController.visualizarDetalhes(IDS_CT03.A);
  assert.equal(tcc.id, IDS_CT03.A);
  assert.equal(tcc.titulo, 'Detecção de anomalias em redes veiculares');
  assert.ok(tcc.resumoSimplificado.length > 0);
  assert.equal(tcc.autor, 'Mariana Souza');
  assert.equal(tcc.orientador, 'Profº Carlos Lima');
  assert.equal(tcc.coorientador, null);
  assert.equal(tcc.ano, 2025);
  assert.equal(tcc.semestre, 1);
  assert.equal(tcc.colecao, 'Ciência da Computação');
  assert.deepEqual(tcc.tags, ['Redes']);
  assert.equal(tcc.imagens.length, 2);
  assert.match(tcc.linkLume, /^https:\/\/lume\.ufrgs\.br\/handle\/10183\/\d+$/);
});

test('FR-013: coorientador e imagens de demonstração aparecem nos detalhes quando existem', () => {
  const base = criarBase([
    criarTcc({
      id: 1,
      coorientador: 'Profª Beatriz Nunes',
      midias: [{ caminhoUrl: 'midias/fig1.png', descricao: 'Figura 1' }],
    }),
  ]);
  const { tccController } = criarAplicacao({ dadosIniciais: base });
  const tcc = tccController.visualizarDetalhes(1);
  assert.equal(tcc.coorientador, 'Profª Beatriz Nunes');
  assert.deepEqual(tcc.imagens, [{ caminhoUrl: 'midias/fig1.png', descricao: 'Figura 1' }]);
});

test('FR-015a (SC-007): o TCC D (sem arquivo) não oferece "Baixar Artigo" e mostra o link do LUME', () => {
  const { tccController } = criarAplicacao();
  const tcc = tccController.visualizarDetalhes(IDS_CT03.D);
  assert.equal(tcc.arquivoDisponivel, false);
  assert.equal(tcc.formatoArquivo, null);
  assert.ok(tcc.linkLume.startsWith('https://lume.ufrgs.br/'));
});

test('FR-013, FR-015: o TCC A (com PDF) oferece "Baixar Artigo"', () => {
  const { tccController } = criarAplicacao();
  const tcc = tccController.visualizarDetalhes(IDS_CT03.A);
  assert.equal(tcc.arquivoDisponivel, true);
  assert.equal(tcc.formatoArquivo, 'PDF');
});

test('FR-014: o TCC E (rascunho) não é apresentado, mesmo pedido diretamente pelo id', () => {
  const { tccController } = criarAplicacao();
  assert.throws(() => tccController.visualizarDetalhes(IDS_CT03.E), TccNaoEncontradoError);
});

test('FR-014: id inexistente lança TccNaoEncontradoError', () => {
  const { tccController } = criarAplicacao();
  assert.throws(() => tccController.visualizarDetalhes(999), TccNaoEncontradoError);
});

// ---------- Download a partir dos detalhes (História 3) ----------

async function conteudoDe(arquivo) {
  return new Uint8Array(await arquivo.arrayBuffer());
}

test('FR-015: o TCC B é baixado como DOCX íntegro, com o tipo MIME correto', async () => {
  const { tccController } = criarAplicacao();
  const resposta = await tccController.baixarArquivo(IDS_CT03.B);
  assert.equal(resposta.sucesso, true);
  assert.equal(resposta.arquivo.name, 'tcc-b.docx');
  assert.equal(
    resposta.arquivo.type,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  );
  assert.deepEqual(await conteudoDe(resposta.arquivo), criarDadosIniciais().arquivos.get('arquivos/tcc-b.docx'));
});

test('FR-015: o TCC C é baixado como EPUB íntegro, com o tipo MIME correto', async () => {
  const { tccController } = criarAplicacao();
  const resposta = await tccController.baixarArquivo(IDS_CT03.C);
  assert.equal(resposta.sucesso, true);
  assert.equal(resposta.arquivo.name, 'tcc-c.epub');
  assert.equal(resposta.arquivo.type, 'application/epub+zip');
  assert.deepEqual(await conteudoDe(resposta.arquivo), criarDadosIniciais().arquivos.get('arquivos/tcc-c.epub'));
});

test('FR-015a: pedir o download do TCC D (sem arquivo) lança ArquivoIndisponivelError', async () => {
  const { tccController } = criarAplicacao();
  await assert.rejects(() => tccController.baixarArquivo(IDS_CT03.D), ArquivoIndisponivelError);
});

test('FR-014: o arquivo do TCC E (rascunho) não pode ser baixado, nem de id inexistente', async () => {
  const { tccController } = criarAplicacao();
  await assert.rejects(() => tccController.baixarArquivo(IDS_CT03.E), TccNaoEncontradoError);
  await assert.rejects(() => tccController.baixarArquivo(999), TccNaoEncontradoError);
});
