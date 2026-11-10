// Resultado de buscarTccs (plan D5): feed, mensagem do FA01 quando vazio e os
// critérios usados, para o usuário ajustar e pesquisar de novo. Origem: FR-012.
export class ResultadoBuscaDTO {
  /**
   * @param {{ tccs: import('./TccDTO.js').TccDTO[], mensagem: string | null,
   *           filtro: import('./FiltroBusca.js').FiltroBusca }} dados
   */
  constructor({ tccs, mensagem = null, filtro }) {
    this.tccs = tccs;
    this.mensagem = mensagem;
    this.filtro = filtro;
  }
}
