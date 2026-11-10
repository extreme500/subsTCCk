// Usuario «abstract» (diagrama de classes). Origem: FR-004, FR-007, FR-013.
export class Usuario {
  constructor({ id, nome, email = '', loginInstitucional = '' }) {
    if (new.target === Usuario) {
      throw new TypeError('Usuario é abstrato e não pode ser instanciado diretamente');
    }
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.loginInstitucional = loginInstitucional;
  }
}
