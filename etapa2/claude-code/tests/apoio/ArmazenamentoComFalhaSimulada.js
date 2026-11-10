// Dublê de ArmazenamentoArquivos que simula a queda da conexão DURANTE a transferência.
// Origem: CT06 (passos 3 e 4); plan, "Simulação da falha de download".
import {
  ArmazenamentoArquivos,
  FalhaTransferenciaError,
} from '../../src/repository/ArmazenamentoArquivos.js';

export class ArmazenamentoComFalhaSimulada extends ArmazenamentoArquivos {
  /** @param {ArmazenamentoArquivos} armazenamentoReal */
  constructor(armazenamentoReal) {
    super();
    this.armazenamentoReal = armazenamentoReal;
    this.interromperAposBytes = null; // null = conexão normal
    this.bytesEntregues = 0; // total entregue em todas as transferências
  }

  /** As próximas transferências entregam `aposBytes` bytes e então falham. */
  interromperConexao({ aposBytes = 0 } = {}) {
    this.interromperAposBytes = aposBytes;
  }

  restabelecerConexao() {
    this.interromperAposBytes = null;
  }

  async *transferir(caminho) {
    let entreguesNestaTransferencia = 0;
    for await (const bloco of this.armazenamentoReal.transferir(caminho)) {
      const limite = this.interromperAposBytes;
      if (limite !== null) {
        const restante = limite - entreguesNestaTransferencia;
        if (restante <= 0) throw new FalhaTransferenciaError('Conexão interrompida');
        if (bloco.length > restante) {
          const parcial = bloco.slice(0, restante);
          entreguesNestaTransferencia += parcial.length;
          this.bytesEntregues += parcial.length;
          yield parcial;
          throw new FalhaTransferenciaError('Conexão interrompida');
        }
      }
      entreguesNestaTransferencia += bloco.length;
      this.bytesEntregues += bloco.length;
      yield bloco;
    }
  }
}
