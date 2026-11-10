import { FiltroBusca } from '../dto/FiltroBusca.js';
import { TccDTO } from '../dto/TccDTO.js';

export const MENSAGEM_NENHUM_TRABALHO_ENCONTRADO =
  'Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros.';

export class TccController {
  constructor({ tccService }) {
    this.tccService = tccService;
    this.detalheAtual = null;
    this.botaoBaixarDisponivel = false;
    this.arquivosSalvosNoDispositivo = [];
  }

  buscarTccs(filtro = new FiltroBusca()) {
    const filtroNormalizado = filtro instanceof FiltroBusca ? filtro : new FiltroBusca(filtro);
    const tccs = this.tccService.buscarPorFiltros(filtroNormalizado);
    const resultados = tccs.map((tcc) => TccDTO.deEntidade(tcc));

    if (resultados.length === 0) {
      return {
        resultados: [],
        mensagem: MENSAGEM_NENHUM_TRABALHO_ENCONTRADO,
      };
    }

    return {
      resultados,
      mensagem: null,
    };
  }

  visualizarDetalhes(id) {
    const tcc = this.tccService.buscarPorId(id);
    const trabalhosConexos = this.listarTrabalhosConexos(id);
    const dto = TccDTO.deEntidade(tcc, { trabalhosConexos });
    this.detalheAtual = dto;
    this.botaoBaixarDisponivel = Boolean(tcc.arquivo);
    return dto;
  }

  listarTrabalhosConexos(id) {
    const conexos = this.tccService.mapearTrabalhosConexos(id);
    return conexos.map((tcc) => TccDTO.deEntidade(tcc));
  }

  baixarArquivo(id) {
    try {
      const { arquivo, linkLume } = this.tccService.obterArquivo(id);
      this.arquivosSalvosNoDispositivo.push(arquivo);
      this.botaoBaixarDisponivel = true;

      return {
        sucesso: true,
        arquivo,
        mensagem: null,
        linkLume,
        paginaDetalhesAberta: this.detalheAtual !== null,
        botaoBaixarDisponivel: true,
      };
    } catch (erro) {
      if (erro.codigo === 'ARQUIVO_INDISPONIVEL') {
        this.botaoBaixarDisponivel = false;
        return {
          sucesso: false,
          arquivo: null,
          mensagem: erro.message,
          linkLume: erro.linkLume,
          paginaDetalhesAberta: this.detalheAtual !== null,
          botaoBaixarDisponivel: false,
        };
      }

      if (erro.codigo === 'FALHA_DOWNLOAD') {
        // UC04-FA02 / CT06: Nenhum arquivo incompleto é salvo e a página permanece aberta com botão disponível
        this.botaoBaixarDisponivel = true;
        return {
          sucesso: false,
          arquivo: null,
          mensagem: erro.message,
          linkLume: erro.linkLume,
          paginaDetalhesAberta: this.detalheAtual !== null,
          botaoBaixarDisponivel: true,
        };
      }

      throw erro;
    }
  }
}
