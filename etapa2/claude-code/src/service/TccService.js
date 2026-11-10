import { StatusTcc } from '../model/StatusTcc.js';
import { TccNaoEncontradoError, ArquivoIndisponivelError, DownloadFalhouError } from './erros.js';

// TccService (diagrama de classes): regras de negócio da busca, detalhes e download.
export class TccService {
  constructor({ tccRepository, armazenamentoArquivos }) {
    this.tccRepository = tccRepository;
    this.armazenamentoArquivos = armazenamentoArquivos;
  }

  /**
   * Só TCCs PUBLICADOS (FR-009), do mais recente para o mais antigo (FR-010, premissa).
   * Filtro vazio lista todos os publicados (FR-011).
   * @param {import('../dto/FiltroBusca.js').FiltroBusca} filtro
   * @returns {import('../model/TCC.js').TCC[]}
   */
  buscarPorFiltros(filtro) {
    return this.tccRepository
      .buscarPorFiltros(filtro)
      .filter((tcc) => tcc.status === StatusTcc.PUBLICADO)
      .sort(compararMaisRecentePrimeiro);
  }

  /**
   * TCC publicado pelo id. Rascunho ou id inexistente: para o leitor, não existe
   * (FR-014; plan D12).
   * @throws {TccNaoEncontradoError}
   */
  buscarPorId(id) {
    const tcc = this.tccRepository.buscarPorId(id);
    if (!tcc || tcc.status !== StatusTcc.PUBLICADO) {
      throw new TccNaoEncontradoError(id);
    }
    return tcc;
  }

  /**
   * Metadados do arquivo de um TCC publicado. Origem: FR-014, FR-015a.
   * @returns {import('../model/ArquivoTcc.js').ArquivoTcc}
   * @throws {TccNaoEncontradoError | ArquivoIndisponivelError}
   */
  obterArquivo(id) {
    const tcc = this.buscarPorId(id);
    if (!tcc.arquivo) {
      throw new ArquivoIndisponivelError(id);
    }
    return tcc.arquivo;
  }

  /**
   * Transfere o arquivo "tudo ou nada": acumula os blocos e só devolve o conteúdo ao fim;
   * se a transferência falhar, descarta o que recebeu (FR-015, FR-016; plan D7).
   * @returns {Promise<{ arquivo: import('../model/ArquivoTcc.js').ArquivoTcc, conteudo: Uint8Array }>}
   * @throws {TccNaoEncontradoError | ArquivoIndisponivelError | DownloadFalhouError}
   */
  async transferirArquivo(id) {
    const arquivo = this.obterArquivo(id);
    let blocos = [];
    try {
      for await (const bloco of this.armazenamentoArquivos.transferir(arquivo.caminho)) {
        blocos.push(bloco);
      }
    } catch (erro) {
      blocos = []; // nada parcial é entregue
      throw new DownloadFalhouError(id, { cause: erro });
    }
    return { arquivo, conteudo: concatenar(blocos) };
  }
}

function concatenar(blocos) {
  const total = blocos.reduce((soma, bloco) => soma + bloco.length, 0);
  const conteudo = new Uint8Array(total);
  let posicao = 0;
  for (const bloco of blocos) {
    conteudo.set(bloco, posicao);
    posicao += bloco.length;
  }
  return conteudo;
}

function compararMaisRecentePrimeiro(a, b) {
  return (
    b.ano - a.ano ||
    b.semestre - a.semestre ||
    a.titulo.localeCompare(b.titulo, 'pt-BR') ||
    a.id - b.id
  );
}
