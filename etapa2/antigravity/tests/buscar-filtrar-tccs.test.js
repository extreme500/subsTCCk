import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { criarApp } from '../src/app.js';
import { FiltroBusca } from '../src/dto/FiltroBusca.js';

const MENSAGEM_FA01 =
  'Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros.';

describe('História 1 - Buscar e filtrar TCCs publicados por critérios combinados (RF#02 / UC04 / US#04)', () => {
  // T010 — CT03 (FR-001, FR-002, FR-003, FR-004, FR-005, FR-007)
  it('[CT03 / FR-001..FR-005] deve retornar apenas o TCC A ao combinar Ano = 2025, Orientador = "Carlos Lima" e Tag = "Redes", ocultando B, C, D e o rascunho E', () => {
    const { controller } = criarApp();

    const resposta = controller.buscarTccs(
      new FiltroBusca({
        ano: 2025,
        orientador: 'Carlos Lima',
        tags: 'Redes',
      })
    );

    assert.equal(resposta.mensagem, null);
    assert.equal(resposta.resultados.length, 1);
    assert.equal(resposta.resultados[0].id, 1);
    assert.equal(resposta.resultados[0].titulo, 'Detecção de anomalias em redes veiculares');
    assert.equal(resposta.resultados[0].ano, 2025);
    assert.equal(resposta.resultados[0].orientador, 'Profº Carlos Lima');
    assert.ok(resposta.resultados[0].tags.includes('Redes'));
  });

  it('[CT03 variação / FR-007] deve exibir a mensagem literal de FA01 quando Ano = 2023 e Tag = "Redes" não encontrarem correspondência', () => {
    const { controller } = criarApp();

    const resposta = controller.buscarTccs({
      ano: 2023,
      tags: 'Redes',
    });

    assert.deepEqual(resposta.resultados, []);
    assert.equal(resposta.mensagem, MENSAGEM_FA01);
  });

  // T011 — CT05 (FR-003, FR-004, FR-005, FR-006, FR-007)
  it('[CT05 passos 1..4 / UC04-FA01 / FR-006 / FR-007] deve exibir mensagem de FA01 ao buscar "blockchain" + Tag = "Redes" e, ao remover o termo, retornar os TCCs publicados A, D e C ordenados (mantendo E oculto)', () => {
    const { controller } = criarApp();

    // Passo 3 do CT05: Termo "blockchain" + Tag "Redes" -> vazio + mensagem FA01
    const passo3 = controller.buscarTccs({
      termo: 'blockchain',
      tags: 'Redes',
    });
    assert.deepEqual(passo3.resultados, []);
    assert.equal(passo3.mensagem, MENSAGEM_FA01);

    // Passo 4 do CT05: Remove "blockchain", mantém Tag "Redes" -> retorna TCCs A, D e C (E oculto por ser rascunho)
    const passo4 = controller.buscarTccs({
      termo: '',
      tags: 'Redes',
    });
    assert.equal(passo4.mensagem, null);
    assert.deepEqual(
      passo4.resultados.map((t) => t.id),
      [1, 4, 3] // Ordenados por ano/semestre decrescente e id crescente: A (2025/1, id 1), D (2025/1, id 4), C (2024/2, id 3)
    );
    assert.ok(!passo4.resultados.some((t) => t.id === 5));
  });

  it('[CT05 variação / FR-004 / FR-007] buscar pelo título exato do rascunho TCC E nunca deve retorná-lo e deve exibir a mensagem de FA01', () => {
    const { controller } = criarApp();

    const resposta = controller.buscarTccs({
      termo: 'Segurança e consenso em redes locais corporativas',
    });

    assert.deepEqual(resposta.resultados, []);
    assert.equal(resposta.mensagem, MENSAGEM_FA01);
  });

  // T012 — Cenários complementares US#04, FR-001, FR-002, FR-005, FR-006
  it('[US#04 / FR-005] deve buscar pelo termo livre em título, resumo, autor, orientador e tags (case-insensitive)', () => {
    const { controller } = criarApp();

    // Busca pelo nome da orientadora na barra de pesquisa (US#04: digitar nome do orientador na barra de pesquisa)
    const porOrientadoraNoTermo = controller.buscarTccs({ termo: 'ana reis' });
    assert.ok(porOrientadoraNoTermo.resultados.some((t) => t.id === 4));

    // Busca pelo nome do autor no filtro de autor
    const porAutor = controller.buscarTccs({ autor: 'maria souza' });
    assert.deepEqual(
      porAutor.resultados.map((t) => t.id),
      [2]
    );

    // Busca por palavra do resumo simplificado
    const porResumo = controller.buscarTccs({ termo: 'triagem hospitalar' });
    assert.deepEqual(
      porResumo.resultados.map((t) => t.id),
      [2]
    );
  });

  it('[FR-005] deve exigir conjunção lógica E quando múltiplas tags forem informadas no filtro', () => {
    const { controller } = criarApp();

    // Apenas TCC A possui simultaneamente "Redes" e "Segurança"
    const resposta = controller.buscarTccs({ tags: ['Redes', 'Segurança'] });
    assert.deepEqual(
      resposta.resultados.map((t) => t.id),
      [1]
    );

    // Nenhum TCC possui simultaneamente "Redes" e "IA"
    const semCorrespondencia = controller.buscarTccs({ tags: 'Redes, IA' });
    assert.deepEqual(semCorrespondencia.resultados, []);
    assert.equal(semCorrespondencia.mensagem, MENSAGEM_FA01);
  });

  it('[FR-006] pesquisa sem nenhum termo ou filtro preenchido deve retornar todos os TCCs publicados ordenados do mais recente ao mais antigo', () => {
    const { controller } = criarApp();

    const resposta = controller.buscarTccs();
    assert.equal(resposta.mensagem, null);
    // Publicados: A (2025/1, id 1), B (2025/1, id 2), D (2025/1, id 4), C (2024/2, id 3). Rascunho E (id 5) oculto.
    assert.deepEqual(
      resposta.resultados.map((t) => t.id),
      [1, 2, 4, 3]
    );
  });
});

describe('História 2 - Visualizar detalhes completos de um TCC selecionado e trabalhos conexos (UC04 passo 7 / UC05 / UC06 / FR-008)', () => {
  // T016 — CT03 passo 4, FR-004, FR-008, UC05, UC06
  it('[CT03 passo 4 / FR-008 / UC05 / UC06] deve exibir todos os dados preenchidos pelo autor do TCC A, incrementar visualizações e listar trabalhos conexos publicados (excluindo o próprio TCC A e o rascunho E)', () => {
    const { controller } = criarApp();

    const detalhes1 = controller.visualizarDetalhes(1);

    assert.equal(detalhes1.id, 1);
    assert.equal(detalhes1.titulo, 'Detecção de anomalias em redes veiculares');
    assert.equal(
      detalhes1.resumoSimplificado,
      'Estudo e implementação de mecanismos para detecção de anomalias de tráfego em redes veiculares.'
    );
    assert.equal(detalhes1.ano, 2025);
    assert.equal(detalhes1.semestre, 1);
    assert.equal(detalhes1.autor, 'João Silva');
    assert.equal(detalhes1.orientador, 'Profº Carlos Lima');
    assert.equal(detalhes1.coorientador, 'Profª Ana Reis');
    assert.equal(detalhes1.linkLume, 'https://lume.ufrgs.br/handle/10183/100001');
    assert.deepEqual(detalhes1.tags, ['Redes', 'Segurança']);
    assert.equal(detalhes1.midias.length, 2);
    assert.equal(detalhes1.possuiArquivo, true);
    assert.equal(detalhes1.arquivo.nomeOriginal, 'tcc-a-deteccao-anomalias-redes-veiculares.pdf');
    assert.equal(detalhes1.visualizacoes, 1);

    // Trabalhos conexos de TCC A (tag "Redes" em comum): D (2025/1, id 4) e C (2024/2, id 3). Rascunho E (id 5) nunca aparece.
    assert.deepEqual(
      detalhes1.trabalhosConexos.map((t) => t.id),
      [4, 3]
    );
    assert.deepEqual(
      controller.listarTrabalhosConexos(1).map((t) => t.id),
      [4, 3]
    );

    // Nova visualização incrementa novamente o contador
    const detalhes2 = controller.visualizarDetalhes(1);
    assert.equal(detalhes2.visualizacoes, 2);
  });

  it('[FR-004 / História 2 Cenário 2] deve impedir a visualização de detalhes de um TCC com status RASCUNHO (TCC E) ou inexistente', () => {
    const { controller } = criarApp();

    assert.throws(() => controller.visualizarDetalhes(5), /TCC não encontrado ou não está publicado/);
    assert.throws(() => controller.visualizarDetalhes(999), /TCC não encontrado ou não está publicado/);
  });
});

const MENSAGEM_FA02 =
  'Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente.';

describe('História 3 - Baixar o arquivo do TCC (UC04 passos 8..9 / FA02 / CT06 / FR-009 / FR-010)', () => {
  // T020 — CT06 (FR-001, FR-009, FR-010)
  it('[CT06 passos 1..4 / UC04-FA02 / FR-009 / FR-010] deve tratar falha de conexão no download com a mensagem literal de FA02, sem salvar arquivo incompleto, mantendo a página aberta com o botão disponível, e concluir o download após restabelecer a conexão', () => {
    const { controller, armazenamentoArquivo } = criarApp();

    // Passo 1 do CT06: Buscar e abrir o TCC A
    const busca = controller.buscarTccs({
      ano: 2025,
      orientador: 'Carlos Lima',
      tags: 'Redes',
    });
    assert.equal(busca.resultados[0].id, 1);
    const detalhesTccA = controller.visualizarDetalhes(1);
    assert.equal(detalhesTccA.id, 1);
    assert.equal(controller.detalheAtual.id, 1);
    assert.equal(controller.botaoBaixarDisponivel, true);

    // Passos 2 e 3 do CT06: Clicar em "Baixar Artigo" e interromper a conexão durante a transferência
    armazenamentoArquivo.definirConexaoAtiva(false);
    const tentativaFalha = controller.baixarArquivo(1);

    assert.equal(tentativaFalha.sucesso, false);
    assert.equal(tentativaFalha.arquivo, null);
    assert.equal(tentativaFalha.mensagem, MENSAGEM_FA02);
    assert.equal(tentativaFalha.paginaDetalhesAberta, true);
    assert.equal(tentativaFalha.botaoBaixarDisponivel, true);
    // Nenhum arquivo incompleto é salvo no dispositivo
    assert.equal(controller.arquivosSalvosNoDispositivo.length, 0);
    assert.equal(controller.detalheAtual.id, 1);
    assert.equal(controller.botaoBaixarDisponivel, true);

    // Passo 4 do CT06: Restabelecer a conexão e clicar novamente em "Baixar Artigo"
    armazenamentoArquivo.definirConexaoAtiva(true);
    const tentativaSucesso = controller.baixarArquivo(1);

    assert.equal(tentativaSucesso.sucesso, true);
    assert.equal(tentativaSucesso.mensagem, null);
    assert.equal(
      tentativaSucesso.arquivo.nomeOriginal,
      'tcc-a-deteccao-anomalias-redes-veiculares.pdf'
    );
    assert.equal(tentativaSucesso.arquivo.formato, 'PDF');
    assert.ok(tentativaSucesso.arquivo.conteudo.includes('Conteúdo integral do artigo do TCC A'));
    assert.equal(controller.arquivosSalvosNoDispositivo.length, 1);
    assert.equal(
      controller.arquivosSalvosNoDispositivo[0].nomeOriginal,
      'tcc-a-deteccao-anomalias-redes-veiculares.pdf'
    );
  });

  // T021 — FR-004, FR-009
  it('[FR-009] deve impedir a transferência e indicar o link oficial do LUME quando o TCC publicado não possuir arquivo próprio anexado (TCC D)', () => {
    const { controller } = criarApp();

    controller.visualizarDetalhes(4);
    const resultado = controller.baixarArquivo(4);

    assert.equal(resultado.sucesso, false);
    assert.equal(resultado.arquivo, null);
    assert.equal(resultado.linkLume, 'https://lume.ufrgs.br/handle/10183/100004');
    assert.ok(resultado.mensagem.includes('https://lume.ufrgs.br/handle/10183/100004'));
    assert.equal(resultado.botaoBaixarDisponivel, false);
    assert.equal(controller.arquivosSalvosNoDispositivo.length, 0);
  });

  it('[FR-004] deve impedir o download de um TCC com status RASCUNHO (TCC E) ou inexistente', () => {
    const { controller } = criarApp();

    assert.throws(() => controller.baixarArquivo(5), /TCC não encontrado ou não está publicado/);
    assert.throws(() => controller.baixarArquivo(999), /TCC não encontrado ou não está publicado/);
  });
});


