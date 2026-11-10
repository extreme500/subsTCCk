// Adaptadores: expõem as duas implementações geradas (Claude Code e Antigravity)
// por uma interface comum, para que o mesmo oráculo de testes rode nas duas.
// Escrito pelo experimentador depois das seis fases; não faz parte de nenhuma delas.

async function adaptadorClaude() {
  const base = '../claude-code';
  const { criarAplicacao } = await import(`${base}/src/app.js`);
  const { criarDadosIniciais } = await import(`${base}/src/repository/dadosIniciais.js`);
  const { ArmazenamentoArquivosEmMemoria } = await import(`${base}/src/repository/ArmazenamentoArquivosEmMemoria.js`);
  const { ArmazenamentoComFalhaSimulada } = await import(`${base}/tests/apoio/ArmazenamentoComFalhaSimulada.js`);

  return function montar() {
    const dados = criarDadosIniciais();
    const armazenamento = new ArmazenamentoComFalhaSimulada(new ArmazenamentoArquivosEmMemoria(dados.arquivos));
    const { tccController: c } = criarAplicacao({ dadosIniciais: dados, armazenamentoArquivos: armazenamento });
    const original = criarDadosIniciais();
    return {
      buscar(filtro) {
        const r = c.buscarTccs(filtro);
        return { ids: r.tccs.map((t) => t.id), mensagem: r.mensagem };
      },
      detalhes(id) {
        const d = c.visualizarDetalhes(id);
        return { autor: d.autor, temArquivo: d.arquivoDisponivel, linkLume: d.linkLume };
      },
      async baixar(id) {
        const r = await c.baixarArquivo(id);
        const bytes = r.arquivo ? (await r.arquivo.arrayBuffer()).byteLength : 0;
        return { sucesso: r.sucesso, mensagem: r.mensagem, bytes };
      },
      tamanhoOriginal(id) {
        const tcc = original.tccs.find((t) => t.id === id);
        return original.arquivos.get(tcc.arquivo.caminho).length;
      },
      interromperConexao: () => armazenamento.interromperConexao({ aposBytes: 20 }),
      restabelecerConexao: () => armazenamento.restabelecerConexao(),
    };
  };
}

async function adaptadorAntigravity() {
  const base = '../antigravity';
  const { criarApp } = await import(`${base}/src/app.js`);
  const { criarDadosIniciais } = await import(`${base}/src/repository/dadosIniciais.js`);

  return function montar() {
    const { controller: c, armazenamentoArquivo } = criarApp();
    const original = criarDadosIniciais();
    return {
      buscar(filtro) {
        const r = c.buscarTccs(filtro);
        return { ids: r.resultados.map((t) => t.id), mensagem: r.mensagem };
      },
      detalhes(id) {
        const d = c.visualizarDetalhes(id);
        return { autor: d.autor, temArquivo: d.possuiArquivo, linkLume: d.linkLume };
      },
      async baixar(id) {
        const r = c.baixarArquivo(id);
        return { sucesso: r.sucesso, mensagem: r.mensagem, bytes: r.arquivo ? r.arquivo.conteudo.length : 0 };
      },
      tamanhoOriginal(id) {
        return original.find((t) => t.id === id).arquivo.conteudo.length;
      },
      // Esta implementação só simula a conexão já caída antes de começar
      // (não há como interromper no meio da transferência).
      interromperConexao: () => armazenamentoArquivo.definirConexaoAtiva(false),
      restabelecerConexao: () => armazenamentoArquivo.definirConexaoAtiva(true),
    };
  };
}

export async function carregarImplementacao(nome) {
  if (nome === 'claude') return adaptadorClaude();
  if (nome === 'antigravity') return adaptadorAntigravity();
  throw new Error(`IMPL desconhecida: ${nome} (use claude ou antigravity)`);
}
