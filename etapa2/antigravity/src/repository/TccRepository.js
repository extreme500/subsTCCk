import { StatusTcc } from '../model/StatusTcc.js';
import { FiltroBusca } from '../dto/FiltroBusca.js';

function contemTexto(alvo, trecho) {
  if (!trecho) return true;
  if (!alvo) return false;
  return String(alvo).toLowerCase().includes(String(trecho).toLowerCase());
}

export class TccRepository {
  constructor(tccsIniciais = []) {
    this.tccs = new Map();
    for (const tcc of tccsIniciais) {
      this.salvarTcc(tcc);
    }
  }

  salvarTcc(tcc) {
    this.tccs.set(tcc.id, tcc);
  }

  buscarPorId(id) {
    return this.tccs.get(Number(id)) ?? null;
  }

  buscarPorFiltros(filtros = new FiltroBusca()) {
    const filtro = filtros instanceof FiltroBusca ? filtros : new FiltroBusca(filtros);
    const tagsFiltro = filtro.obterListaTags().map((t) => t.toLowerCase());

    const resultados = [];

    for (const tcc of this.tccs.values()) {
      // FR-004: Somente TCCs com status PUBLICADO podem aparecer nos resultados
      if (tcc.status !== StatusTcc.PUBLICADO) {
        continue;
      }

      // Filtro por Ano (FR-002, FR-003)
      if (filtro.ano !== null && !Number.isNaN(filtro.ano) && tcc.ano !== filtro.ano) {
        continue;
      }

      // Filtro por Autor — substring case-insensitive (FR-005)
      if (filtro.autor && !contemTexto(tcc.autor?.nome, filtro.autor)) {
        continue;
      }

      // Filtro por Orientador — substring case-insensitive (FR-005, CT03)
      if (filtro.orientador && !contemTexto(tcc.orientador?.nome, filtro.orientador)) {
        continue;
      }

      // Filtro por Tags — conjunção lógica E case-insensitive (FR-005)
      if (tagsFiltro.length > 0) {
        const nomesTagsTcc = (tcc.tags ?? []).map((tag) => String(tag.nome).toLowerCase());
        const possuiTodasTags = tagsFiltro.every((tagBuscada) =>
          nomesTagsTcc.some((nomeTagTcc) => nomeTagTcc === tagBuscada)
        );
        if (!possuiTodasTags) {
          continue;
        }
      }

      // Termo livre — substring case-insensitive em título, resumoSimplificado, autor, orientador/coorientador e tags (FR-005, US#04, CT05)
      if (filtro.termo) {
        const correspondeTitulo = contemTexto(tcc.titulo, filtro.termo);
        const correspondeResumo = contemTexto(tcc.resumoSimplificado, filtro.termo);
        const correspondeAutor = contemTexto(tcc.autor?.nome, filtro.termo);
        const correspondeOrientador = contemTexto(tcc.orientador?.nome, filtro.termo);
        const correspondeCoorientador = contemTexto(tcc.coorientador?.nome, filtro.termo);
        const correspondeTag = (tcc.tags ?? []).some((tag) => contemTexto(tag.nome, filtro.termo));

        if (
          !(
            correspondeTitulo ||
            correspondeResumo ||
            correspondeAutor ||
            correspondeOrientador ||
            correspondeCoorientador ||
            correspondeTag
          )
        ) {
          continue;
        }
      }

      resultados.push(tcc);
    }

    return resultados;
  }

  buscarPorTags(tags = []) {
    const nomesAlvo = (tags ?? [])
      .map((t) => (typeof t === 'string' ? t : t?.nome ?? ''))
      .map((nome) => String(nome).trim().toLowerCase())
      .filter((nome) => nome.length > 0);

    if (nomesAlvo.length === 0) {
      return [];
    }

    const resultados = [];
    for (const tcc of this.tccs.values()) {
      if (tcc.status !== StatusTcc.PUBLICADO) {
        continue;
      }
      const possuiTagEmComum = (tcc.tags ?? []).some((tag) =>
        nomesAlvo.includes(String(tag.nome).trim().toLowerCase())
      );
      if (possuiTagEmComum) {
        resultados.push(tcc);
      }
    }
    return resultados;
  }
}
