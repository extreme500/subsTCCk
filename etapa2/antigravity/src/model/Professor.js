import { Usuario } from './Usuario.js';

export class Professor extends Usuario {
  constructor({ id, nome, email = '', loginInstitucional = '', departamento = '' }) {
    super({ id, nome, email, loginInstitucional });
    this.departamento = departamento;
  }
}

