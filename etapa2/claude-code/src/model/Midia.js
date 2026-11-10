// Midia (diagrama de classes): imagem de demonstração do TCC. Origem: FR-013.
export class Midia {
  constructor({ id, caminhoUrl, descricao = '' }) {
    this.id = id;
    this.caminhoUrl = caminhoUrl;
    this.descricao = descricao;
  }
}
