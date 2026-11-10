export class FiltroBusca {
  constructor({ termo = '', ano = null, autor = '', orientador = '', tags = '' } = {}) {
    this.termo = typeof termo === 'string' ? termo.trim() : '';
    this.ano = ano !== null && ano !== undefined && ano !== '' ? Number(ano) : null;
    this.autor = typeof autor === 'string' ? autor.trim() : '';
    this.orientador = typeof orientador === 'string' ? orientador.trim() : '';
    this.tags = tags;
  }

  obterListaTags() {
    if (Array.isArray(this.tags)) {
      return this.tags
        .map((t) => (typeof t === 'string' ? t.trim() : String(t?.nome ?? '').trim()))
        .filter((t) => t.length > 0);
    }
    if (typeof this.tags === 'string' && this.tags.trim().length > 0) {
      return this.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }
    return [];
  }
}

