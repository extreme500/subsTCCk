// Fábricas de TCCs e bases para cenários que não usam a base do CT03.
// Origem: FR-003a, FR-004, FR-006, FR-008, FR-013 (plan, "Dados iniciais").
import { TCC } from '../../src/model/TCC.js';
import { Tag } from '../../src/model/Tag.js';
import { Midia } from '../../src/model/Midia.js';
import { ArquivoTcc } from '../../src/model/ArquivoTcc.js';
import { Professor } from '../../src/model/Professor.js';
import { AlunoFormando } from '../../src/model/AlunoFormando.js';
import { StatusTcc } from '../../src/model/StatusTcc.js';

let proximoIdPessoa = 1000;

/**
 * Cria um TCC a partir de dados simples (nomes em vez de objetos).
 * Padrões: publicado, 2025/1, coleção "Ciência da Computação", sem arquivo.
 */
export function criarTcc({
  id,
  titulo = `TCC ${id}`,
  resumoSimplificado = 'Resumo simplificado.',
  ano = 2025,
  semestre = 1,
  linkLume = `https://lume.ufrgs.br/handle/10183/${800000 + id}`,
  status = StatusTcc.PUBLICADO,
  colecao = 'Ciência da Computação',
  autor = 'Autor Exemplo',
  orientador = 'Profº Orientador Exemplo',
  coorientador = null,
  tags = ['Redes'],
  midias = [],
  arquivo = null,
}) {
  return new TCC({
    id,
    titulo,
    resumoSimplificado,
    ano,
    semestre,
    linkLume,
    status,
    colecao,
    autor: new AlunoFormando({ id: proximoIdPessoa++, nome: autor }),
    orientador: new Professor({ id: proximoIdPessoa++, nome: orientador }),
    coorientador: coorientador ? new Professor({ id: proximoIdPessoa++, nome: coorientador }) : null,
    tags: tags.map((nome, i) => new Tag({ id: i + 1, nome })),
    midias: midias.map((m, i) => new Midia({ id: i + 1, ...m })),
    arquivo: arquivo ? new ArquivoTcc(arquivo) : null,
  });
}

/** Monta `dadosIniciais` para `criarAplicacao({ dadosIniciais })`. */
export function criarBase(tccs, arquivos = new Map()) {
  return { tccs, arquivos };
}

/** Fotografia serializada dos TCCs do repositório, para verificar que nada mudou (FR-002). */
export function fotografarRepositorio(tccRepository) {
  return JSON.stringify([...tccRepository.tccs.values()]);
}
