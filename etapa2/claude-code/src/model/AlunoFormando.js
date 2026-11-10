import { Usuario } from './Usuario.js';

// AlunoFormando (herda de Usuario). Autor do TCC.
export class AlunoFormando extends Usuario {
  constructor({ matricula = '', ...dados }) {
    super(dados);
    this.matricula = matricula;
  }
}
