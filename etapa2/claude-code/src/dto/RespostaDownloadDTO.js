// Resposta de baixarArquivo (plan D6): o File em caso de sucesso, ou a mensagem do FA02
// e a indicação de que o usuário pode tentar de novo. Origem: FR-015, FR-016.
export class RespostaDownloadDTO {
  /**
   * @param {{ sucesso: boolean, arquivo?: import('node:buffer').File | null,
   *           mensagem?: string | null, podeTentarNovamente?: boolean }} dados
   */
  constructor({ sucesso, arquivo = null, mensagem = null, podeTentarNovamente = false }) {
    this.sucesso = sucesso;
    this.arquivo = arquivo;
    this.mensagem = mensagem;
    this.podeTentarNovamente = podeTentarNovamente;
  }
}
