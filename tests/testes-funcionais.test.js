// Testes funcionais (classes de equivalência e valor limite) executados contra a lógica do protótipo
// (src/lib.js e src/data.js). Os IDs CV/CI e CT seguem a seção 7 do relatório da Etapa 2.
// Os testes marcados como "todo" registram onde o protótipo ainda diverge das decisões do grupo:
// eles rodam e aparecem no relatório do node --test, mas não reprovam a suíte.
// Executar na raiz do repositório: node --test tests/
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { buscar, estadoInicial, validarCamposObrigatorios, validarIntegridadeLink, formatoDoArquivo, LUME_REGEX } from '../src/lib.js';
import { SEMESTRES, LIMITE_TAGS, LIMITE_MIDIAS } from '../src/data.js';

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
  test('CT41 (CI29): nenhum semestre posterior ao atual (2026/2) pode ser escolhido', () => {
    const posteriores = SEMESTRES.filter((s) => { const [a, sem] = s.split('/').map(Number); return a * 10 + sem > 2026 * 10 + 2; });
    assert.deepEqual(posteriores, []);
  });
  test('CT41 (valor limite): o semestre atual (2026/2) deveria estar na lista', { todo: 'divergência: a lista do protótipo termina em 2026/1' }, () => {
    assert.ok(SEMESTRES.includes('2026/2'));
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
    assert.ok(ids({ orientador: 'Profª Ana Reis' }).length > 0);
    assert.ok(ids({ tags: ['IA'] }).length > 0);
    assert.deepEqual(ids({ orientador: 'Profª Ana Reis', tags: ['IA'] }), []);
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
  test('CT33 (CI26): termo no meio de uma palavra não deveria casar ("IA" não encontra "anomalias")', { todo: 'divergência: o protótipo casa qualquer trecho' }, () => {
    const comTagIa = tccs.filter((t) => t.status === 'PUBLICADO' && t.tags.includes('IA')).map((t) => t.id).sort();
    assert.deepEqual(ids({ termo: 'IA' }), comTagIa);
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
