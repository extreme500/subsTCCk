// Testes funcionais (classes de equivalência e valor limite) executados contra a lógica do protótipo
// (src/lib.js e src/data.js). Os IDs CV/CI e CT seguem a seção 7 do relatório da Etapa 2.
// Na Etapa 2, dois testes ficaram como "todo" (divergências do protótipo). Na Etapa 3 o protótipo
// foi ajustado (lista de semestres e termo pelo início da palavra) e as regras da seção 2.2
// (rascunho, edição, exclusão e limites de tamanho) ganharam testes próprios (CT49 a CT54).
// Executar na raiz do repositório: node --test tests/
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buscar, estadoInicial, validarCamposObrigatorios, validarRascunho, validarIntegridadeLink, formatoDoArquivo, LUME_REGEX,
  decidirPublicacao, verificarTamanho, papelNaExclusao, excluirTcc, casaInicioDePalavra,
} from '../src/lib.js';
import {
  SEMESTRES, LIMITE_TAGS, LIMITE_MIDIAS, LIMITE_TITULO, LIMITE_RESUMO, LIMITE_NOME_TAG, LIMITE_ARQUIVO_MB, LIMITE_IMAGEM_MB,
  listarSemestres, semestreAtual,
} from '../src/data.js';

const tccs = estadoInicial().tccs;
const ids = (filtro) => buscar(tccs, filtro).map((t) => t.id).sort();
const valido = () => ({
  titulo: 'Detecção de anomalias em redes veiculares',
  resumo: 'Resumo simplificado.',
  anoSemestre: '2025/2',
  orientador: 'Prof. Carlos Lima',
  linkLume: 'https://lume.ufrgs.br/handle/10183/299999',
  tags: ['Redes'],
});
const errosCom = (alteracao) => validarCamposObrigatorios({ ...valido(), ...alteracao });

describe('UC01 Cadastrar TCC: classes de equivalência', () => {
  test('CT07 (CV02, CV03, CV04, CV05, CV08, CV09): formulário completo não tem erros', () => {
    assert.deepEqual(validarCamposObrigatorios(valido()), {});
  });
  test('CT12 (CI02): Título vazio leva ao FA01; só espaços conta como vazio (lacuna L04)', () => {
    assert.equal(errosCom({ titulo: '' }).titulo, true);
    assert.equal(errosCom({ titulo: '   ' }).titulo, true);
  });
  test('CT13 (CI03): Resumo vazio leva ao FA01', () => {
    assert.equal(errosCom({ resumo: '' }).resumo, true);
  });
  test('CT40 (CI23): Ano/Semestre não escolhido leva ao FA01 (lacuna L06)', () => {
    assert.equal(errosCom({ anoSemestre: '' }).anoSemestre, true);
  });
  test('CT14 (CI04): Orientador não escolhido leva ao FA01', () => {
    assert.equal(errosCom({ orientador: '' }).orientador, true);
  });
  test('CT22 (CI08): link do LUME vazio leva ao FA01 (lacuna L10)', () => {
    assert.equal(errosCom({ linkLume: '' }).linkLume, true);
  });
  test('CT02 e CT18 (CI05): URL de outro domínio, inclusive parecido com o do LUME, é recusada', () => {
    for (const url of ['http://exemplo.com/tcc-123', 'https://lume.ufrgs.br.exemplo.com/handle/10183/1', 'https://lume-ufrgs.br/handle/10183/1', 'lume.ufrgs.br', 'não é uma URL']) {
      assert.equal(LUME_REGEX.test(url), false, url);
    }
  });
  test('CT01 (CV08): formatos aceitos do link do LUME (lacuna L11)', () => {
    for (const url of ['https://lume.ufrgs.br/handle/10183/290114', 'http://lume.ufrgs.br/handle/10183/290114', 'https://www.lume.ufrgs.br/handle/10183/290114/']) {
      assert.equal(LUME_REGEX.test(url), true, url);
    }
  });
  test('CT21 (CI07): com o LUME indisponível, até um link correto é recusado (FA02)', async () => {
    assert.equal(await validarIntegridadeLink('https://lume.ufrgs.br/handle/10183/290114', true), false);
    assert.equal(await validarIntegridadeLink('https://lume.ufrgs.br/handle/10183/290114', false), true);
  });
  test('CT07 a CT09 e CT18 (CV14 a CV16, CI12): formatos do arquivo do trabalho', () => {
    assert.equal(formatoDoArquivo('tcc.pdf'), 'PDF');
    assert.equal(formatoDoArquivo('tcc.docx'), 'DOCX');
    assert.equal(formatoDoArquivo('TCC.EPUB'), 'EPUB');
    assert.equal(formatoDoArquivo('tcc.odt'), null);
    assert.equal(formatoDoArquivo('sem-extensao'), null);
  });
});

describe('UC01 Cadastrar TCC: valores limite', () => {
  test('Limites definidos no protótipo: 5 tags e 3 imagens', () => {
    assert.equal(LIMITE_TAGS, 5);
    assert.equal(LIMITE_MIDIAS, 3);
  });
  test('CT15, CT07, CT08, CT09, CT10 e CT16: quantidade de tags 0, 1, 2, 4, 5 e 6', () => {
    const tags = ['Redes', 'IA', 'Segurança', 'Sistemas Distribuídos', 'Engenharia de Software', 'Robótica'];
    assert.equal(errosCom({ tags: [] }).tags, true, '0 tag');
    for (const n of [1, 2, 4, 5]) assert.equal(errosCom({ tags: tags.slice(0, n) }).tags, undefined, `${n} tags`);
    assert.equal(errosCom({ tags }).tags, true, '6 tags');
  });
  test('Ano/Semestre: o primeiro e o último semestre da lista podem ser escolhidos', () => {
    assert.equal(errosCom({ anoSemestre: SEMESTRES.at(-1) }).anoSemestre, undefined);
    assert.equal(errosCom({ anoSemestre: SEMESTRES[0] }).anoSemestre, undefined);
  });
  test('CT41 (CI29 e valor limite): com o semestre atual 2026/2, a lista vai de 2023/1 a 2026/2', () => {
    const lista = listarSemestres('2026/2');
    assert.equal(lista[0], '2026/2', 'o semestre atual pode ser escolhido');
    assert.equal(lista.at(-1), '2023/1');
    assert.ok(!lista.includes('2027/1'), 'o semestre seguinte não aparece');
    assert.equal(lista.length, 8);
  });
  test('CT41: o semestre atual depende da data (julho fecha o 1º semestre; agosto abre o 2º)', () => {
    assert.equal(semestreAtual(new Date(2026, 6, 31)), '2026/1');
    assert.equal(semestreAtual(new Date(2026, 7, 1)), '2026/2');
    assert.equal(SEMESTRES[0], semestreAtual());
  });
});

describe('UC04 Buscar e Filtrar TCCs: classes de equivalência', () => {
  test('CT03 (CV26, CV30, CV32, CV33, CV34): Ano 2025 + Orientador Carlos Lima + Tag Redes retorna só o TCC A; o rascunho E nunca aparece', () => {
    assert.deepEqual(ids({ ano: 2025, orientador: 'Prof. Carlos Lima', tags: ['Redes'] }), ['a']);
  });
  test('CT35 (busca sem critérios): lista todos os publicados, do mais recente para o mais antigo', () => {
    const r = buscar(tccs, {});
    assert.equal(r.length, tccs.filter((t) => t.status === 'PUBLICADO').length);
    assert.ok(!r.some((t) => t.status !== 'PUBLICADO'));
    for (let i = 1; i < r.length; i++) assert.ok(r[i - 1].ano * 10 + r[i - 1].semestre >= r[i].ano * 10 + r[i].semestre);
  });
  test('CT42 (parecer: cada filtro sozinho): todo resultado atende ao critério e é publicado', () => {
    const sem = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const casos = [
      [{ ano: 2024 }, (t) => t.ano === 2024],
      [{ autor: 'Castro' }, (t) => sem(t.autor).includes('castro')],
      [{ orientador: 'Profª Ana Reis' }, (t) => t.orientador === 'Profª Ana Reis' || t.coorientador === 'Profª Ana Reis'],
      [{ colecao: 'Ciência da Computação' }, (t) => t.colecao === 'Ciência da Computação'],
      [{ tags: ['Segurança'] }, (t) => t.tags.includes('Segurança')],
      [{ termo: 'redes' }, (t) => sem([t.titulo, t.resumo, t.autor, t.orientador, t.coorientador, ...t.tags].join(' ')).includes('redes')],
    ];
    for (const [filtro, atende] of casos) {
      const r = buscar(tccs, filtro);
      const esperado = tccs.filter((t) => t.status === 'PUBLICADO' && atende(t));
      assert.ok(r.length > 0, JSON.stringify(filtro));
      assert.deepEqual(r.map((t) => t.id).sort(), esperado.map((t) => t.id).sort(), JSON.stringify(filtro));
    }
  });
  test('CT43 (parecer: combinações de filtros): cada combinação devolve a interseção dos filtros isolados', () => {
    const combinacoes = [
      [{ ano: 2025 }, { tags: ['Redes'] }],
      [{ orientador: 'Prof. Carlos Lima' }, { colecao: 'Ciência da Computação' }],
      [{ ano: 2025 }, { orientador: 'Prof. Carlos Lima' }, { tags: ['Segurança'] }],
      [{ termo: 'redes' }, { colecao: 'Engenharia de Computação' }, { ano: 2025 }],
    ];
    for (const partes of combinacoes) {
      const junto = ids(Object.assign({}, ...partes));
      const intersecao = partes.map((f) => new Set(ids(f))).reduce((a, b) => new Set([...a].filter((x) => b.has(x))));
      assert.deepEqual(junto, [...intersecao].sort(), JSON.stringify(partes));
    }
  });
  test('CT27 e CT28 (CI16, CI17): autor e orientador sem TCC levam a resultado vazio (FA01)', () => {
    assert.deepEqual(ids({ autor: 'Fulano Inexistente' }), []);
    assert.deepEqual(ids({ orientador: 'Profª Inexistente' }), []);
  });
  test('CV28: filtro de autor por trecho, sem diferenciar maiúsculas e acentos', () => {
    assert.deepEqual(ids({ autor: 'ferreira' }), ['a']);
    assert.deepEqual(ids({ autor: 'vinicius' }), ['k']);
  });
  test('CT29 (CI18): tag sem TCC leva a resultado vazio', () => {
    assert.deepEqual(ids({ tags: ['Blockchain'] }), []);
  });
  test('CT34 (CV44, CI28): várias tags combinam por E', () => {
    assert.deepEqual(ids({ tags: ['Redes', 'IA'] }), ['c']);
    assert.deepEqual(ids({ tags: ['Redes', 'Robótica'] }), []);
  });
  test('CT30 (CI19): critérios que têm resultado sozinhos, mas sem interseção', () => {
    assert.ok(ids({ orientador: 'Profª Juliana Prates' }).length > 0);
    assert.ok(ids({ tags: ['IA'] }).length > 0);
    assert.deepEqual(ids({ orientador: 'Profª Juliana Prates', tags: ['IA'] }), []);
  });
  test('CT31 (CV43, CI27): filtro de coleção (curso)', () => {
    assert.deepEqual(ids({ colecao: 'Engenharia de Computação' }), ['b', 'd', 'k']);
    assert.deepEqual(ids({ colecao: 'Física' }), []);
  });
  test('CT32 (CV40): termo sem acento e com maiúsculas diferentes encontra o título acentuado', () => {
    assert.ok(ids({ termo: 'deteccao' }).includes('a'));
    assert.ok(ids({ termo: 'DETECÇÃO' }).includes('a'));
  });
  test('CT24 (CV24, CV41): termo encontra orientador, autor e tag', () => {
    assert.deepEqual(ids({ termo: 'Juliana' }), ['f', 'j']);
    assert.deepEqual(ids({ termo: 'Castro' }), ['l']);
    assert.deepEqual(ids({ termo: 'banco de dados' }), ['j']);
  });
  test('CT33 (CV41): termo casa o início de uma palavra ("rede" encontra "redes")', () => {
    assert.ok(ids({ termo: 'rede' }).length > 0);
  });
  test('CT33 (CI26): termo no meio de uma palavra não casa ("IA" não encontra "anomalias")', () => {
    const comTagIa = tccs.filter((t) => t.status === 'PUBLICADO' && t.tags.includes('IA')).map((t) => t.id).sort();
    assert.deepEqual(ids({ termo: 'IA' }), comTagIa);
    assert.equal(casaInicioDePalavra('Detecção de anomalias', 'ia'), false);
    assert.equal(casaInicioDePalavra('Detecção de anomalias', 'anomalia'), true);
    assert.equal(casaInicioDePalavra('Detecção de anomalias em redes veiculares', 'anomalias em redes'), true);
  });
  test('L22: o filtro Orientador também encontra o professor como coorientador', () => {
    assert.ok(ids({ orientador: 'Profª Ana Reis' }).includes('c'), 'Ana Reis coorienta o TCC C');
    assert.deepEqual(ids({ ano: 2025, orientador: 'Prof. Carlos Lima', tags: ['Redes'] }), ['a'], 'o CT03 continua valendo');
  });
});

describe('UC04 Buscar e Filtrar TCCs: valores limite', () => {
  test('CT25 e CT26: filtro de ano em volta do menor (2023) e do maior (2025) ano com TCC publicado', () => {
    assert.deepEqual(ids({ ano: 2022 }), []);
    assert.deepEqual(ids({ ano: 2023 }), ['k']);
    assert.ok(ids({ ano: 2024 }).length > 0);
    assert.ok(ids({ ano: 2025 }).length > 0);
    assert.deepEqual(ids({ ano: 2026 }), []);
  });
  test('Quantidade de resultados 0, 1 e 2 (fronteira do FA01)', () => {
    assert.equal(ids({ termo: 'astronomia' }).length, 0); // "blockchain" existe no TCC H desta base
    assert.equal(ids({ termo: 'Castro' }).length, 1);
    assert.equal(ids({ termo: 'Juliana' }).length, 2);
  });
});

describe('Regras da seção 2.2 e limites de tamanho (CT49 a CT54)', () => {
  const aluna = { cartao: '00312345', papel: 'ALUNO_FORMANDO', nome: 'Marina Souza' };
  const carlos = { cartao: '00012345', papel: 'PROFESSOR', nome: 'Prof. Carlos Lima' };
  const ana = { cartao: '00099999', papel: 'PROFESSOR', nome: 'Profª Ana Reis' };
  const daAluna = { ...tccs[0], id: 'm', autor: 'Marina Souza', autorId: '00312345', orientador: 'Prof. Carlos Lima', coorientador: '' };
  const base = [...tccs, daAluna];

  test('CT49: título com 200 e 201 caracteres; resumo com 1.500 e 1.501', () => {
    assert.equal(LIMITE_TITULO, 200);
    assert.equal(LIMITE_RESUMO, 1500);
    assert.equal(errosCom({ titulo: 'x'.repeat(200) }).titulo, undefined);
    assert.equal(errosCom({ titulo: 'x'.repeat(201) }).titulo, true);
    assert.equal(errosCom({ resumo: 'x'.repeat(1500) }).resumo, undefined);
    assert.equal(errosCom({ resumo: 'x'.repeat(1501) }).resumo, true);
    assert.equal(LIMITE_NOME_TAG, 30);
  });
  test('CT50: arquivo do trabalho até 20 MB e imagem até 5 MB', () => {
    const MB = 1024 * 1024;
    assert.equal(verificarTamanho(LIMITE_ARQUIVO_MB * MB, LIMITE_ARQUIVO_MB, 'O arquivo'), null);
    assert.match(verificarTamanho(LIMITE_ARQUIVO_MB * MB + 1, LIMITE_ARQUIVO_MB, 'O arquivo'), /20 MB/);
    assert.equal(verificarTamanho(LIMITE_IMAGEM_MB * MB, LIMITE_IMAGEM_MB, 'A imagem'), null);
    assert.match(verificarTamanho(LIMITE_IMAGEM_MB * MB + 1, LIMITE_IMAGEM_MB, 'A imagem'), /5 MB/);
  });
  test('CT51: "Salvar como rascunho" exige só o título', () => {
    const soTitulo = { titulo: 'Meu TCC', resumo: '', anoSemestre: '', orientador: '', linkLume: '', tags: [] };
    assert.deepEqual(validarRascunho(soTitulo), {});
    assert.deepEqual(validarRascunho({ ...soTitulo, titulo: '   ' }), { titulo: true });
    assert.ok(Object.keys(validarCamposObrigatorios(soTitulo)).length > 1, 'para publicar, os outros campos continuam obrigatórios');
  });
  test('CT02, CT45 e CT52: o que acontece depois da validação do link', () => {
    assert.equal(decidirPublicacao(null, true), 'PUBLICAR');
    assert.equal(decidirPublicacao(null, false), 'OFERECER_RASCUNHO', 'cadastro novo: FA02');
    assert.equal(decidirPublicacao({ status: 'RASCUNHO' }, true), 'PUBLICAR', 'CT45: rascunho com link corrigido');
    assert.equal(decidirPublicacao({ status: 'PUBLICADO' }, false), 'MANTER_PUBLICADO', 'CT52: a edição não despublica');
  });
  test('CT53: o autor exclui o próprio TCC, que some da base', () => {
    assert.equal(papelNaExclusao(daAluna, aluna), 'AUTOR');
    const depois = excluirTcc(base, 'm', aluna);
    assert.ok(!depois.some((t) => t.id === 'm'));
    assert.ok(!buscar(depois, {}).some((t) => t.id === 'm'));
  });
  test('CT54: o orientador devolve o TCC a rascunho; outro professor não pode excluir', () => {
    assert.equal(papelNaExclusao(daAluna, ana), null, 'Ana Reis não orienta este TCC');
    assert.deepEqual(excluirTcc(base, 'm', ana), base);
    assert.equal(papelNaExclusao(daAluna, carlos), 'ORIENTADOR');
    const depois = excluirTcc(base, 'm', carlos);
    const tcc = depois.find((t) => t.id === 'm');
    assert.equal(tcc.status, 'RASCUNHO');
    assert.equal(tcc.devolvidoPor, 'Prof. Carlos Lima');
    assert.ok(!buscar(depois, {}).some((t) => t.id === 'm'), 'sai do feed e da busca');
    assert.equal(papelNaExclusao(tccs.find((t) => t.id === 'c'), ana), 'ORIENTADOR', 'a coorientadora também pode');
    assert.equal(papelNaExclusao(daAluna, null), null, 'visitante não exclui');
    assert.equal(papelNaExclusao(tccs[0], aluna), null, 'aluno não exclui TCC de outro autor');
  });
});
