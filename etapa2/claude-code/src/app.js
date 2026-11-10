// Ponto de entrada: monta a aplicação e permite injetar dependências
// (ex.: armazenamento que simula falha de download nos testes do CT06).
import { TccController } from './controller/TccController.js';
import { TccService } from './service/TccService.js';
import { TccRepositoryEmMemoria } from './repository/TccRepositoryEmMemoria.js';
import { ArmazenamentoArquivosEmMemoria } from './repository/ArmazenamentoArquivosEmMemoria.js';
import { criarDadosIniciais } from './repository/dadosIniciais.js';

/**
 * @param {object} [opcoes]
 * @param {import('./repository/TccRepository.js').TccRepository} [opcoes.tccRepository]
 * @param {import('./repository/ArmazenamentoArquivos.js').ArmazenamentoArquivos} [opcoes.armazenamentoArquivos]
 * @param {{ tccs: import('./model/TCC.js').TCC[], arquivos: Map<string, Uint8Array> }} [opcoes.dadosIniciais]
 */
export function criarAplicacao(opcoes = {}) {
  const dados = opcoes.dadosIniciais ?? criarDadosIniciais();
  const tccRepository = opcoes.tccRepository ?? new TccRepositoryEmMemoria(dados.tccs);
  const armazenamentoArquivos =
    opcoes.armazenamentoArquivos ?? new ArmazenamentoArquivosEmMemoria(dados.arquivos);
  const tccService = new TccService({ tccRepository, armazenamentoArquivos });
  const tccController = new TccController(tccService);
  return { tccController, tccService, tccRepository, armazenamentoArquivos };
}
