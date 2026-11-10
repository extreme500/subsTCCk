export class Usuario {
  constructor({ id, nome, email = '', loginInstitucional = '' }) {
    if (new.target === Usuario) {
      throw new Error('Usuario é uma classe abstrata e não pode ser instanciada diretamente.');
    }
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.loginInstitucional = loginInstitucional;
  }
}

