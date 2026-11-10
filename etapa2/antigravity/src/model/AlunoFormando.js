import { Usuario } from './Usuario.js';

export class AlunoFormando extends Usuario {
  constructor({ id, nome, email = '', loginInstitucional = '', matricula = '' }) {
    super({ id, nome, email, loginInstitucional });
    this.matricula = matricula;
  }
}

