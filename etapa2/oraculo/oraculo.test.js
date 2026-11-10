// Oráculo independente: os mesmos testes, escritos pelo experimentador a partir dos
// CTs da Etapa 1 e das decisões do grupo (decisoes-clarify.md), rodados contra as
// duas implementações geradas. Uso:
//   IMPL=claude node --test oraculo/
//   IMPL=antigravity node --test oraculo/
// Nos dados das duas implementações, os TCCs A a E do CT03 têm ids 1 a 5.
import { describe, test, before } from 'node:test';
import assert from 'node:assert/strict';
import { carregarImplementacao } from './adaptadores.js';

const A = 1, B = 2, C = 3, D = 4, E = 5;
const FA01 = 'Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros.';
const FA02 = 'Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente.';
const ordenado = (ids) => [...ids].sort((x, y) => x - y);

let montar;
before(async () => {
  montar = await carregarImplementacao(process.env.IMPL);
});

describe('Grupo 1: casos de teste da Etapa 1', () => {
  test('CT03: Ano 2025 + Orientador "Carlos Lima" + Tag "Redes" retorna só o TCC A', () => {
    const r = montar().buscar({ ano: 2025, orientador: 'Carlos Lima', tags: ['Redes'] });
    assert.deepEqual(r.ids, [A]);
  });

  test('CT03 variação: Ano 2023 + Tag "Redes" retorna vazio com a mensagem do FA01', () => {
    const r = montar().buscar({ ano: 2023, tags: ['Redes'] });
    assert.deepEqual(r.ids, []);
    assert.equal(r.mensagem, FA01);
  });

  test('CT05: "blockchain" + Redes dá FA01; sem o termo, volta {A, C, D} e nunca E', () => {
    const app = montar();
    const vazio = app.buscar({ termo: 'blockchain', tags: ['Redes'] });
    assert.deepEqual(vazio.ids, []);
    assert.equal(vazio.mensagem, FA01);
    const depois = app.buscar({ tags: ['Redes'] });
    assert.deepEqual(ordenado(depois.ids), [A, C, D]);
  });

  test('CT05 variação: buscar pelo título do rascunho E não o retorna', () => {
    const app = montar();
    // título tirado dos dados de cada implementação: o rascunho E não aparece em busca
    // nenhuma, então usa-se uma palavra que só existe no título de E nos dois conjuntos.
    const r = app.buscar({ termo: 'Monitoramento de tráfego em redes 5G' });
    const r2 = app.buscar({ termo: 'Segurança e consenso em redes locais corporativas' });
    assert.ok(!r.ids.includes(E) && !r2.ids.includes(E));
  });

  test('CT06: falha na transferência mostra o FA02, nada é entregue, e a nova tentativa entrega o arquivo inteiro', async () => {
    const app = montar();
    app.interromperConexao();
    const falha = await app.baixar(A);
    assert.equal(falha.sucesso, false);
    assert.equal(falha.mensagem, FA02);
    assert.equal(falha.bytes, 0);
    app.restabelecerConexao();
    const ok = await app.baixar(A);
    assert.equal(ok.sucesso, true);
    assert.equal(ok.bytes, app.tamanhoOriginal(A));
  });
});

describe('Grupo 2: decisões do grupo no Clarify', () => {
  test('Decisão 1: filtro Coleção (curso) existe e restringe o resultado', () => {
    const app = montar();
    const outroCurso = app.buscar({ colecao: 'Engenharia Elétrica' });
    assert.deepEqual(outroCurso.ids, [], 'um curso sem TCCs deveria dar resultado vazio');
    assert.equal(outroCurso.mensagem, FA01);
  });

  test('Decisão 2a: termo livre ignora maiúsculas', () => {
    assert.ok(montar().buscar({ termo: 'DETECÇÃO' }).ids.includes(A));
  });

  test('Decisão 2b: termo livre ignora acentos ("deteccao" encontra "Detecção")', () => {
    assert.ok(montar().buscar({ termo: 'deteccao' }).ids.includes(A));
  });

  test('Decisão 2c: termo livre procura no nome do orientador e nas tags', () => {
    const app = montar();
    // "includes", não igualdade: nos dados do Antigravity Ana Reis também é coorientadora
    // do TCC A, e a busca dele também olha o coorientador (o que é razoável).
    assert.ok(app.buscar({ termo: 'Ana Reis' }).ids.includes(D));
    assert.ok(app.buscar({ termo: 'redes' }).ids.includes(D));
  });

  test('Decisão 2d: termo livre procura no nome do autor', () => {
    const app = montar();
    const autorB = app.detalhes(B).autor;
    assert.ok(app.buscar({ termo: autorB.split(' ').at(-1) }).ids.includes(B));
  });

  test('Decisão 3: com várias tags, o TCC precisa ter todas (E)', () => {
    const r = montar().buscar({ tags: ['Redes', 'IA'] });
    assert.deepEqual(r.ids, []);
  });

  test('Decisão 4: TCC publicado sem arquivo (D) não oferece download e mostra o link do LUME', () => {
    const d = montar().detalhes(D);
    assert.equal(d.temArquivo, false);
    assert.match(String(d.linkLume), /lume\.ufrgs\.br/);
  });

  test('Decisão 5: pesquisa sem termo e sem filtros lista todos os publicados', () => {
    const r = montar().buscar({});
    assert.deepEqual(ordenado(r.ids), [A, B, C, D]);
    assert.equal(r.mensagem, null);
  });
});

describe('Grupo 3: robustez (não decidido pelo grupo; serve de observação)', () => {
  test('Rascunho E: detalhes e download são recusados', async () => {
    const app = montar();
    assert.throws(() => app.detalhes(E));
    let recusado = false;
    try {
      const r = await app.baixar(E);
      recusado = r.sucesso === false;
    } catch {
      recusado = true;
    }
    assert.ok(recusado);
  });

  test('Filtro de autor parcial e sem diferenciar maiúsculas', () => {
    const app = montar();
    const autorA = app.detalhes(A).autor;
    const sobrenome = autorA.split(' ').at(-1).toLowerCase();
    assert.ok(app.buscar({ autor: sobrenome }).ids.includes(A));
  });

  test('Termo curto "IA" não deveria trazer TCCs que só têm "anomalias" ou "estratégias"', () => {
    const r = montar().buscar({ termo: 'IA' });
    assert.ok(!r.ids.includes(A), `retornou ${JSON.stringify(r.ids)}`);
  });

  test('Ano inválido ("abc") não deveria ser ignorado em silêncio', () => {
    let resultado;
    try {
      resultado = montar().buscar({ ano: 'abc' });
    } catch {
      return; // recusar o filtro é aceitável
    }
    assert.notDeepEqual(ordenado(resultado.ids), [A, B, C, D], 'o filtro inválido foi descartado e a busca trouxe tudo');
  });
});
