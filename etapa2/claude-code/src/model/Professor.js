import { Usuario } from './Usuario.js';

// Professor (herda de Usuario). Orientador ou coorientador de TCCs.
export class Professor extends Usuario {
  constructor({ departamento = '', ...dados }) {
    super(dados);
    this.departamento = departamento;
  }
}
