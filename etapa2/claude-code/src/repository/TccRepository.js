// «interface» TccRepository (diagrama de classes; constituição IV).
// Implementações concretas estendem esta classe e sobrescrevem os métodos.
export class TccRepository {
  /** @param {import('../model/TCC.js').TCC} tcc */
  salvarTcc(tcc) { // eslint-disable-line no-unused-vars
    throw new Error('não implementado');
  }

  /** @returns {import('../model/TCC.js').TCC | null} */
  buscarPorId(id) { // eslint-disable-line no-unused-vars
    throw new Error('não implementado');
  }

  /**
   * Devolve os TCCs (de qualquer status) que atendem a todos os critérios preenchidos.
   * @param {import('../dto/FiltroBusca.js').FiltroBusca} filtros
   * @returns {import('../model/TCC.js').TCC[]}
   */
  buscarPorFiltros(filtros) { // eslint-disable-line no-unused-vars
    throw new Error('não implementado');
  }
}
