// Erros da camada de negócio. Origem: FR-014, FR-015a, FR-016.

/** TCC inexistente ou não publicado (rascunho): para o leitor, não existe (FR-014). */
export class TccNaoEncontradoError extends Error {
  constructor(id) {
    super(`TCC ${id} não encontrado`);
    this.name = 'TccNaoEncontradoError';
    this.id = id;
  }
}

/** TCC publicado sem arquivo anexado: "Baixar Artigo" não é oferecido (FR-015a). */
export class ArquivoIndisponivelError extends Error {
  constructor(id) {
    super(`TCC ${id} não possui arquivo para download`);
    this.name = 'ArquivoIndisponivelError';
    this.id = id;
  }
}

/** A transferência do arquivo falhou; nada parcial é entregue (FR-016). */
export class DownloadFalhouError extends Error {
  constructor(id, { cause } = {}) {
    super(`Falha na transferência do arquivo do TCC ${id}`, { cause });
    this.name = 'DownloadFalhouError';
    this.id = id;
  }
}
