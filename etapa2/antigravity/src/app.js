import { criarDadosIniciais } from './repository/dadosIniciais.js';
import { TccRepository } from './repository/TccRepository.js';
import { ArmazenamentoArquivo } from './service/ArmazenamentoArquivo.js';
import { TccService } from './service/TccService.js';
import { TccController } from './controller/TccController.js';

export function criarApp(opcoes = {}) {
  const tccsIniciais = opcoes.tccsIniciais ?? criarDadosIniciais();
  const repository = opcoes.repository ?? new TccRepository(tccsIniciais);
  const armazenamentoArquivo = opcoes.armazenamentoArquivo ?? new ArmazenamentoArquivo();
  const service =
    opcoes.service ??
    new TccService({
      tccRepository: repository,
      armazenamentoArquivo,
    });
  const controller = new TccController({ tccService: service });

  return {
    controller,
    service,
    repository,
    armazenamentoArquivo,
  };
}

