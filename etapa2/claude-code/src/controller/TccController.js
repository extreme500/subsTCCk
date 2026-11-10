import { File } from 'node:buffer';
import { FiltroBusca } from '../dto/FiltroBusca.js';
import { TccDTO } from '../dto/TccDTO.js';
import { ResultadoBuscaDTO } from '../dto/ResultadoBuscaDTO.js';
import { RespostaDownloadDTO } from '../dto/RespostaDownloadDTO.js';
import { FormatoArquivo } from '../model/FormatoArquivo.js';
import { DownloadFalhouError } from '../service/erros.js';
import { MENSAGEM_NENHUM_RESULTADO, MENSAGEM_FALHA_DOWNLOAD } from './mensagens.js';

// TccController (diagrama de classes): API pública = interface com o usuário.
// Nenhum método recebe credencial: qualquer leitor, inclusive visitante, pode usá-los (FR-001).
export class TccController {
  constructor(tccService) {
    this.tccService = tccService;
  }

  /**
   * UC04 passos 3 a 5 e FA01. Origem: FR-003, FR-011, FR-012.
   * @param {FiltroBusca | object} [filtro]
   * @returns {ResultadoBuscaDTO}
   * @throws {import('../dto/FiltroBusca.js').FiltroInvalidoError}
   */
  buscarTccs(filtro = {}) {
    const criterios = filtro instanceof FiltroBusca ? filtro : new FiltroBusca(filtro);
    const tccs = this.tccService.buscarPorFiltros(criterios).map((tcc) => TccDTO.deTcc(tcc));
    return new ResultadoBuscaDTO({
      tccs,
      mensagem: tccs.length === 0 ? MENSAGEM_NENHUM_RESULTADO : null,
      filtro: new FiltroBusca(criterios),
    });
  }

  /**
   * UC04 passos 6-7. `arquivoDisponivel` indica se "Baixar Artigo" deve ser oferecido.
   * Origem: FR-013, FR-014, FR-015a.
   * @returns {TccDTO}
   * @throws {import('../service/erros.js').TccNaoEncontradoError}
   */
  visualizarDetalhes(id) {
    return TccDTO.deTcc(this.tccService.buscarPorId(id));
  }

  /**
   * UC04 passos 8-9 e FA02. Origem: FR-015, FR-016.
   * @returns {Promise<RespostaDownloadDTO>}
   * @throws {import('../service/erros.js').TccNaoEncontradoError} TCC inexistente ou rascunho.
   * @throws {import('../service/erros.js').ArquivoIndisponivelError} TCC sem arquivo
   *   (o botão "Baixar Artigo" não deveria ter sido oferecido).
   */
  async baixarArquivo(id) {
    try {
      const { arquivo, conteudo } = await this.tccService.transferirArquivo(id);
      return new RespostaDownloadDTO({
        sucesso: true,
        arquivo: new File([conteudo], arquivo.nomeOriginal, { type: TIPOS_MIME[arquivo.formato] }),
      });
    } catch (erro) {
      if (erro instanceof DownloadFalhouError) {
        return new RespostaDownloadDTO({
          sucesso: false,
          mensagem: MENSAGEM_FALHA_DOWNLOAD,
          podeTentarNovamente: true,
        });
      }
      throw erro;
    }
  }
}

const TIPOS_MIME = Object.freeze({
  [FormatoArquivo.PDF]: 'application/pdf',
  [FormatoArquivo.DOCX]: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  [FormatoArquivo.EPUB]: 'application/epub+zip',
});
