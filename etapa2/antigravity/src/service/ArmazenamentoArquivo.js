export class ArmazenamentoArquivo {
  constructor({ conexaoAtiva = true } = {}) {
    this.conexaoAtiva = conexaoAtiva;
  }

  definirConexaoAtiva(ativa) {
    this.conexaoAtiva = Boolean(ativa);
  }

  transferirArquivo(arquivo) {
    if (!arquivo) {
      throw new Error('Arquivo inexistente para transferência.');
    }

    // Simula a leitura/transferência em blocos com descarte atômico caso a conexão caia
    const conteudoOriginal = String(arquivo.conteudo ?? '');
    const metade = Math.ceil(conteudoOriginal.length / 2);
    let bufferParcial = conteudoOriginal.slice(0, metade);

    if (!this.conexaoAtiva) {
      // Descarta atomicamente qualquer dado parcial para nunca gerar arquivo incompleto
      bufferParcial = null;
      const erro = new Error('Falha de conexão durante a transferência do arquivo.');
      erro.codigo = 'FALHA_TRANSFERENCIA';
      throw erro;
    }

    const conteudoCompleto = bufferParcial + conteudoOriginal.slice(metade);
    return {
      nomeOriginal: arquivo.nomeOriginal,
      formato: arquivo.formato,
      caminho: arquivo.caminho,
      conteudo: conteudoCompleto,
    };
  }
}
