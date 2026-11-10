// CT06 - Falha durante o download do artigo (RF#02, UC04 FA02, US#04).
// Verifica: FR-015, FR-016; SC-004.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarAplicacao } from '../src/app.js';
import { criarDadosIniciais, IDS_CT03 } from '../src/repository/dadosIniciais.js';
import { ArmazenamentoArquivosEmMemoria } from '../src/repository/ArmazenamentoArquivosEmMemoria.js';
import { MENSAGEM_FALHA_DOWNLOAD } from '../src/controller/mensagens.js';
import { ArmazenamentoComFalhaSimulada } from './apoio/ArmazenamentoComFalhaSimulada.js';

function montarCenario() {
  const dados = criarDadosIniciais();
  const armazenamento = new ArmazenamentoComFalhaSimulada(new ArmazenamentoArquivosEmMemoria(dados.arquivos));
  const app = criarAplicacao({ dadosIniciais: dados, armazenamentoArquivos: armazenamento });
  // "Dispositivo do usuário": só guarda o que o sistema efetivamente entrega.
  const dispositivo = [];
  const baixarParaDispositivo = async (id) => {
    const resposta = await app.tccController.baixarArquivo(id);
    if (resposta.sucesso) dispositivo.push(resposta.arquivo);
    return resposta;
  };
  const pdfOriginal = criarDadosIniciais().arquivos.get('arquivos/tcc-a.pdf');
  return { ...app, armazenamento, dispositivo, baixarParaDispositivo, pdfOriginal };
}

test('CT06 passo 1: buscar e abrir o TCC A, que oferece "Baixar Artigo"', () => {
  const { tccController } = montarCenario();
  const [tccA] = tccController.buscarTccs({ ano: 2025, orientador: 'Carlos Lima', tags: ['Redes'] }).tccs;
  assert.equal(tccA.id, IDS_CT03.A);
  assert.equal(tccController.visualizarDetalhes(tccA.id).arquivoDisponivel, true);
});

test('CT06 passos 2-3 (FR-016, SC-004): conexão interrompida durante a transferência exibe a mensagem do FA02 e nada é salvo', async () => {
  const { tccController, armazenamento, dispositivo, baixarParaDispositivo, pdfOriginal } = montarCenario();
  armazenamento.interromperConexao({ aposBytes: 20 });

  const resposta = await baixarParaDispositivo(IDS_CT03.A);

  assert.equal(resposta.sucesso, false);
  assert.equal(resposta.arquivo, null);
  assert.equal(resposta.mensagem, MENSAGEM_FALHA_DOWNLOAD);
  assert.equal(
    resposta.mensagem,
    'Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente.',
  );
  assert.equal(resposta.podeTentarNovamente, true);
  // A falha ocorreu no meio: parte dos bytes já tinha sido transferida...
  assert.ok(armazenamento.bytesEntregues > 0);
  assert.ok(armazenamento.bytesEntregues < pdfOriginal.length);
  // ...mas nenhum arquivo incompleto chegou ao dispositivo.
  assert.equal(dispositivo.length, 0);
  // A página do TCC continua aberta, com "Baixar Artigo" disponível.
  assert.equal(tccController.visualizarDetalhes(IDS_CT03.A).arquivoDisponivel, true);
});

test('CT06 passo 4 (FR-015, FR-016, SC-004): com a conexão restabelecida, o PDF do TCC A é salvo íntegro', async () => {
  const { armazenamento, dispositivo, baixarParaDispositivo, pdfOriginal } = montarCenario();
  armazenamento.interromperConexao({ aposBytes: 20 });
  await baixarParaDispositivo(IDS_CT03.A);

  armazenamento.restabelecerConexao();
  const resposta = await baixarParaDispositivo(IDS_CT03.A);

  assert.equal(resposta.sucesso, true);
  assert.equal(resposta.mensagem, null);
  assert.equal(dispositivo.length, 1);
  const arquivo = dispositivo[0];
  assert.equal(arquivo.name, 'tcc-a.pdf');
  assert.equal(arquivo.type, 'application/pdf');
  assert.deepEqual(new Uint8Array(await arquivo.arrayBuffer()), pdfOriginal);
});

test('CT06 variação (FR-016): falhas repetidas exibem sempre a mesma mensagem, sem limite de tentativas', async () => {
  const { armazenamento, dispositivo, baixarParaDispositivo } = montarCenario();
  armazenamento.interromperConexao({ aposBytes: 5 });
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const resposta = await baixarParaDispositivo(IDS_CT03.A);
    assert.equal(resposta.sucesso, false);
    assert.equal(resposta.mensagem, MENSAGEM_FALHA_DOWNLOAD);
    assert.equal(resposta.podeTentarNovamente, true);
  }
  assert.equal(dispositivo.length, 0);
  armazenamento.restabelecerConexao();
  assert.equal((await baixarParaDispositivo(IDS_CT03.A)).sucesso, true);
});

test('CT06 (FR-016): falha antes do primeiro byte também exibe a mensagem do FA02', async () => {
  const { armazenamento, dispositivo, baixarParaDispositivo } = montarCenario();
  armazenamento.interromperConexao({ aposBytes: 0 });
  const resposta = await baixarParaDispositivo(IDS_CT03.A);
  assert.equal(resposta.sucesso, false);
  assert.equal(resposta.mensagem, MENSAGEM_FALHA_DOWNLOAD);
  assert.equal(dispositivo.length, 0);
});
