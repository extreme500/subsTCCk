import { FiltroBusca } from '../dto/FiltroBusca.js';
import { StatusTcc } from '../model/StatusTcc.js';

export function ordenarTccsPorRecencia(listaTccs) {
  return [...listaTccs].sort((a, b) => {
    if (b.ano !== a.ano) {
      return b.ano - a.ano;
    }
    if (b.semestre !== a.semestre) {
      return b.semestre - a.semestre;
    }
    return a.id - b.id;
  });
}

export const MENSAGEM_ERRO_DOWNLOAD =
  'Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente.';

export class TccService {
  constructor({ tccRepository, armazenamentoArquivo }) {
    this.tccRepository = tccRepository;
    this.armazenamentoArquivo = armazenamentoArquivo;
  }

  buscarPorFiltros(filtro = new FiltroBusca()) {
    const filtroNormalizado = filtro instanceof FiltroBusca ? filtro : new FiltroBusca(filtro);
    const encontrados = this.tccRepository.buscarPorFiltros(filtroNormalizado);
    return ordenarTccsPorRecencia(encontrados);
  }

  buscarPorId(id) {
    const tcc = this.tccRepository.buscarPorId(id);
    if (!tcc || tcc.status !== StatusTcc.PUBLICADO) {
      throw new Error('TCC não encontrado ou não está publicado.');
    }
    tcc.registrarVisualizacao();
    return tcc;
  }

  mapearTrabalhosConexos(id) {
    const tccReferencia = this.tccRepository.buscarPorId(id);
    if (!tccReferencia || tccReferencia.status !== StatusTcc.PUBLICADO) {
      throw new Error('TCC não encontrado ou não está publicado.');
    }
    const mesmaTag = this.tccRepository.buscarPorTags(tccReferencia.tags);
    const conexos = mesmaTag.filter(
      (candidato) => candidato.id !== tccReferencia.id && candidato.status === StatusTcc.PUBLICADO
    );
    return ordenarTccsPorRecencia(conexos);
  }

  obterArquivo(id) {
    const tcc = this.tccRepository.buscarPorId(id);
    if (!tcc || tcc.status !== StatusTcc.PUBLICADO) {
      throw new Error('TCC não encontrado ou não está publicado.');
    }

    // FR-009: TCC publicado sem arquivo próprio anexado (multiplicidade 0..1)
    if (!tcc.arquivo) {
      const erroSemArquivo = new Error(
        `Arquivo para download direto não está disponível. Consulte o trabalho pelo link oficial do LUME: ${tcc.linkLume}`
      );
      erroSemArquivo.codigo = 'ARQUIVO_INDISPONIVEL';
      erroSemArquivo.linkLume = tcc.linkLume;
      throw erroSemArquivo;
    }

    try {
      const arquivoTransferido = this.armazenamentoArquivo.transferirArquivo(tcc.arquivo);
      return {
        arquivo: arquivoTransferido,
        linkLume: tcc.linkLume,
      };
    } catch {
      const erroDownload = new Error(MENSAGEM_ERRO_DOWNLOAD);
      erroDownload.codigo = 'FALHA_DOWNLOAD';
      erroDownload.linkLume = tcc.linkLume;
      throw erroDownload;
    }
  }
}
