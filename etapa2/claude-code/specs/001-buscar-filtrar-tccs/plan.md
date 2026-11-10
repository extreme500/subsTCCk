# Plano de implementação: Buscar e Filtrar TCCs

**Pasta:** `specs/001-buscar-filtrar-tccs` | **Data:** 2026-11-08 | **Especificação:** `spec.md`

## Resumo

Implementar o UC04 (RF#02, parte de busca/filtro/download) como uma biblioteca em camadas (controller → service → repository → model, com dto), sem interface gráfica: a interface com o usuário é a API pública do `TccController`. A busca combina termo livre (título, resumo, autor, orientador e tags, com correspondência parcial e sem diferenciar maiúsculas/minúsculas e acentos) com filtros de ano, autor, orientador, tags (todas obrigatórias) e coleção (curso de origem), sempre restrita a TCCs PUBLICADOS. O download passa por uma interface de armazenamento de arquivos que entrega o conteúdo em blocos. O serviço só devolve o arquivo quando a transferência termina; em caso de falha, descarta o que recebeu e o controller devolve a mensagem literal do FA02. A persistência é em memória, com os TCCs A a E do CT03 como dados iniciais. `src/app.js` monta a aplicação e permite injetar o repositório, o armazenamento e os dados iniciais (é assim que os testes simulam a falha de download).

## Contexto técnico

- **Linguagem/versão:** JavaScript (ES modules) em Node.js 20 ou superior.
- **Dependências:** nenhuma dependência externa. Só módulos nativos do Node (`node:test`, `node:assert/strict`, `node:buffer` para `File`). Um `package.json` mínimo só declara `"type": "module"` e o script de teste, sem `dependencies`, e não é preciso rodar `npm install`.
- **Armazenamento:** em memória (`Map`) para TCCs e para o conteúdo dos arquivos.
- **Testes:** executor nativo `node --test`, com arquivos `tests/**/*.test.js` e asserções de `node:assert/strict`.
- **Plataforma:** qualquer SO com Node.js 20+; a execução é por linha de comando.
- **Restrições:** sem interface gráfica; camadas e nomes conforme os diagramas de pacotes e de classes; mensagens literais dos casos de uso; nada além do necessário para a especificação (constituição V).

## Verificação da constituição

| Princípio | Cumpre? | Como |
|---|---|---|
| I. Rastreabilidade | Sim | Cada FR da spec aparece na tabela de rastreabilidade, ligado a componente(s) e teste(s). Cada arquivo de teste e cada `test(...)` cita no nome o CT ou FR que verifica (ex.: `"CT03: ..."`, `"FR-008: ..."`). As tarefas (fase Tasks) vão citar os FRs. |
| II. Testes dos CTs, antes do código | Sim | CT03, CT05 e CT06 viram os arquivos `tests/ct03-*.test.js`, `tests/ct05-*.test.js` e `tests/ct06-*.test.js`, que usam os dados e os passos literais do relatório. Os FRs sem CT direto (esclarecimentos P1 a P5, FR-001, FR-002, FR-013 a FR-015a) têm testes próprios. A ordem prevista para a fase Tasks é: testes primeiro, execução com falha (módulos ainda inexistentes) e só então a implementação. |
| III. Fidelidade ao domínio | Sim, com divergências registradas | Os nomes de classes, métodos e atributos vêm dos diagramas (`TccController.buscarTccs/visualizarDetalhes/baixarArquivo`, `TccService.buscarPorFiltros/buscarPorId/obterArquivo`, `TccRepository.salvarTcc/buscarPorId/buscarPorFiltros`, `TCC`, `ArquivoTcc`, `StatusTcc`, `FormatoArquivo`, `TccDTO`, `FiltroBusca` etc.). As mensagens do FA01 e do FA02 são constantes com o texto literal do UC04. Tudo o que foi acrescentado ou mudado em relação aos diagramas está na seção "Divergências entre especificação e diagramas", com a decisão tomada. |
| IV. Arquitetura em camadas | Sim | As pastas `controller/`, `service/`, `repository/`, `model/` e `dto/` seguem as dependências do diagrama de pacotes (controller → service, dto; service → repository, dto, model; repository → model, dto). O armazenamento de arquivos (raia "Armazenamento de Arquivos" do diagrama de atividades) fica atrás da interface `ArmazenamentoArquivos`, substituível nos testes. O LUME não é chamado nesta funcionalidade. |
| V. Simplicidade | Sim | Sem dependências, sem GUI, persistência em memória. Não serão implementados métodos dos diagramas que pertencem a outras funcionalidades (feed, trabalhos conexos, cadastro/edição, validação do LUME, `TagRepository`, `Area`); a lista está nas divergências. |
| VI. Ambiguidade explicitada | Sim | Os cinco marcadores da spec foram resolvidos na fase Clarify. As decisões técnicas que a spec não fixa estão na tabela de decisões, e os pontos sem resposta no material estão em "Riscos e pontos em aberto". Nenhum deles altera comportamento exigido pela spec. |

## Estrutura do projeto

```text
claude-code/
├── package.json                         # { "type": "module", "scripts": { "test": "node --test" } }, sem dependências
├── src/
│   ├── app.js                           # criarAplicacao(opcoes): monta e injeta dependências
│   ├── controller/
│   │   ├── TccController.js             # API pública (interface com o usuário)
│   │   └── mensagens.js                 # textos literais do UC04 (FA01, FA02)
│   ├── service/
│   │   ├── TccService.js                # regras de negócio: só PUBLICADO, ordenação, download
│   │   └── erros.js                     # TccNaoEncontradoError, ArquivoIndisponivelError, DownloadFalhouError
│   ├── repository/
│   │   ├── TccRepository.js             # «interface» (classe base cujos métodos lançam "não implementado")
│   │   ├── TccRepositoryEmMemoria.js    # implementação em memória + correspondência dos critérios
│   │   ├── normalizacao.js              # funções puras de comparação de texto
│   │   ├── ArmazenamentoArquivos.js     # «interface» + FalhaTransferenciaError
│   │   ├── ArmazenamentoArquivosEmMemoria.js
│   │   └── dadosIniciais.js             # TCCs A–E do CT03 e conteúdo dos arquivos
│   ├── model/
│   │   ├── Usuario.js                   # «abstract»
│   │   ├── Professor.js
│   │   ├── AlunoFormando.js
│   │   ├── TCC.js
│   │   ├── Tag.js
│   │   ├── Midia.js
│   │   ├── ArquivoTcc.js
│   │   ├── StatusTcc.js                 # «enumeration»
│   │   └── FormatoArquivo.js            # «enumeration»
│   └── dto/
│       ├── FiltroBusca.js               # + FiltroInvalidoError
│       ├── TccDTO.js
│       ├── ResultadoBuscaDTO.js
│       └── RespostaDownloadDTO.js
└── tests/
    ├── apoio/
    │   ├── ArmazenamentoComFalhaSimulada.js   # dublê que interrompe a "conexão"
    │   └── fabricas.js                        # monta bases de TCCs específicas para cenários fora do CT03
    ├── ct03-buscar-filtros-combinados.test.js
    ├── ct05-busca-sem-correspondencia.test.js
    ├── ct06-falha-download.test.js
    ├── busca-termo-livre.test.js
    ├── busca-tags-colecao.test.js
    ├── busca-sem-criterios.test.js
    ├── detalhes.test.js
    └── acesso-leitura.test.js
```

## Modelo de dados

Derivado do diagrama de classes e da spec (Entidades-chave). Os enumerados são objetos congelados (`Object.freeze`). Os atributos privados (`-` no diagrama) viram propriedades públicas somente leitura no uso (sem getters/setters, para simplificar); as camadas superiores não recebem objetos de modelo, só DTOs.

| Entidade | Atributos | Relações / regras |
|---|---|---|
| `Usuario` «abstract» | `id: number`, `nome: string`, `email: string`, `loginInstitucional: string` | Não pode ser instanciado diretamente (o construtor lança erro se `new.target === Usuario`). |
| `Professor` extends `Usuario` | `departamento: string` | Orientador (obrigatório) e coorientador (opcional) de um TCC. |
| `AlunoFormando` extends `Usuario` | `matricula: string` | Autor do TCC (exatamente 1). |
| `TCC` | `id: number`, `titulo: string`, `resumoSimplificado: string`, `ano: number`, `semestre: number` (1 ou 2), `linkLume: string`, `status: StatusTcc`, `visualizacoes: number` (padrão 0), **`colecao: string`** (curso de origem, novo; P1) | `autor: AlunoFormando`; `orientador: Professor`; `coorientador: Professor \| null` (as duas pontas do 1..2 com Professor); `tags: Tag[]` (1..5, agregação); `midias: Midia[]` (0..3, composição); `arquivo: ArquivoTcc \| null` (0..1, composição). |
| `Tag` | `id: number`, `nome: string` | Agregada pelo TCC. A ligação Tag → Área não é modelada (Área está fora de escopo, P1). |
| `Midia` | `id: number`, `caminhoUrl: string`, `descricao: string` | Imagens de demonstração exibidas nos detalhes. |
| `ArquivoTcc` | `nomeOriginal: string`, `formato: FormatoArquivo`, `caminho: string` | `caminho` é a chave do conteúdo no `ArmazenamentoArquivos`. |
| `StatusTcc` | `RASCUNHO`, `PUBLICADO` | Só `PUBLICADO` é visível ao leitor (FR-009, FR-014). |
| `FormatoArquivo` | `DOCX`, `PDF`, `EPUB` | Define o tipo MIME do `File` devolvido no download. |

**Estados:** esta funcionalidade só lê o status, sem transições. Os TCCs com status `RASCUNHO` existem no repositório, mas o serviço os trata como inexistentes.

**Regras de validação neste escopo:** as multiplicidades (1..5 tags, 0..3 mídias) e os campos obrigatórios são responsabilidade do cadastro (UC01) e não são revalidados aqui; os dados iniciais já as respeitam.

**Dados iniciais (`dadosIniciais.js`):** os TCCs A a E do CT03, com as tags e os status literais do relatório. Todos são da coleção "Ciência da Computação". Os títulos, os autores e os resumos são fictícios, e nenhum TCC tem "blockchain" no texto (pré-condição do CT05).

| TCC | id | Título | Ano/Sem. | Orientador | Tag | Status | Arquivo |
|---|---|---|---|---|---|---|---|
| A | 1 | Detecção de anomalias em redes veiculares | 2025/1 | Profº Carlos Lima | Redes | PUBLICADO | PDF (CT06) |
| B | 2 | Aprendizado de máquina para triagem de chamados | 2025/1 | Profº Carlos Lima | IA | PUBLICADO | DOCX |
| C | 3 | Roteamento em redes definidas por software | 2024/2 | Profº Carlos Lima | Redes | PUBLICADO | EPUB |
| D | 4 | Protocolos de comunicação para Internet das Coisas | 2025/1 | Profª Ana Reis | Redes | PUBLICADO | nenhum (FR-015a) |
| E | 5 | Monitoramento de tráfego em redes 5G | 2025/1 | Profº Carlos Lima | Redes | RASCUNHO | PDF |

O conteúdo de cada arquivo é uma sequência de bytes fictícia com mais de um bloco de transferência, para que a falha "no meio" seja possível. O módulo exporta `IDS_CT03 = { A: 1, B: 2, C: 3, D: 4, E: 5 }` para os testes. Os cenários que precisam de outras bases (coleções diferentes, várias tags por TCC, acentos) montam a própria base com `tests/apoio/fabricas.js` e a injetam por `criarAplicacao({ dadosIniciais })`, sem alterar a base do CT03. Assim, SC-008 (pesquisa vazia → A, B, C, D) continua valendo.

## Contratos

Convenções: o controller recebe e devolve só DTOs e tipos simples. Os erros são classes que estendem `Error`, com `name` igual ao nome da classe. Busca e detalhes são síncronos; o download é assíncrono (`Promise`).

### `src/app.js`

- `criarAplicacao(opcoes?)` → `{ tccController, tccService, tccRepository, armazenamentoArquivos }`
  - `opcoes.tccRepository?: TccRepository`: se ausente, cria um `TccRepositoryEmMemoria` com os dados iniciais.
  - `opcoes.armazenamentoArquivos?: ArmazenamentoArquivos`: se ausente, cria um `ArmazenamentoArquivosEmMemoria` com o conteúdo dos dados iniciais.
  - `opcoes.dadosIniciais?: { tccs: TCC[], arquivos: Map<string, Uint8Array> }`: substitui a base padrão (A–E). Usado quando os repositórios não são injetados.
  - Erros: nenhum.

### Camada controller: `TccController` (API pública)

- `constructor(tccService: TccService)`
- `buscarTccs(filtro: FiltroBusca | object): ResultadoBuscaDTO`
  - Aceita um `FiltroBusca` ou um objeto simples com os mesmos campos, que é convertido em `FiltroBusca`. Todos os campos são opcionais.
  - Retorna `ResultadoBuscaDTO`: com resultados, `mensagem = null`; sem resultados, `tccs = []` e `mensagem` com o texto literal do FA01. Em ambos os casos, `filtro` devolve os critérios usados (FR-012: o usuário ajusta e pesquisa de novo).
  - Erros: `FiltroInvalidoError` quando `ano` não é um inteiro.
- `visualizarDetalhes(id: number): TccDTO`
  - Retorna o `TccDTO` completo (FR-013), com `arquivoDisponivel` indicando se o botão "Baixar Artigo" deve ser oferecido (FR-015a).
  - Erros: `TccNaoEncontradoError` se o id não existe ou o TCC não está PUBLICADO (FR-014).
- `baixarArquivo(id: number): Promise<RespostaDownloadDTO>`
  - Sucesso: `{ sucesso: true, arquivo: File, mensagem: null, podeTentarNovamente: false }`, onde `File` (de `node:buffer`) tem `name = nomeOriginal`, `type` = MIME do formato e o conteúdo completo.
  - Falha na transferência: `{ sucesso: false, arquivo: null, mensagem: <texto literal do FA02>, podeTentarNovamente: true }`. Nenhum conteúdo parcial é devolvido (FR-016).
  - Erros (lançados, pois indicam uso indevido da API e não uma falha de transferência): `TccNaoEncontradoError` (inexistente ou rascunho) e `ArquivoIndisponivelError` (TCC sem arquivo, caso em que o botão não deveria ter sido oferecido).

### `src/controller/mensagens.js`

- `MENSAGEM_NENHUM_RESULTADO = "Nenhum trabalho encontrado para os critérios informados. Tente ajustar ou remover alguns filtros."` (UC04 FA01)
- `MENSAGEM_FALHA_DOWNLOAD = "Ocorreu um erro durante o download, verifique a sua conexão com a internet e tente novamente."` (UC04 FA02)

### Camada service: `TccService`

- `constructor({ tccRepository: TccRepository, armazenamentoArquivos: ArmazenamentoArquivos })`
- `buscarPorFiltros(filtro: FiltroBusca): TCC[]`: pede ao repositório os TCCs que atendem aos critérios, mantém só os `PUBLICADO` (FR-009) e ordena por ano desc., semestre desc. e título asc. (`localeCompare` com `"pt-BR"`). Não lança erros.
- `buscarPorId(id: number): TCC`: lança `TccNaoEncontradoError` se o TCC não existe ou não está `PUBLICADO`.
- `obterArquivo(id: number): ArquivoTcc`: usa `buscarPorId`; lança `TccNaoEncontradoError` ou `ArquivoIndisponivelError` (TCC sem arquivo).
- `transferirArquivo(id: number): Promise<{ arquivo: ArquivoTcc, conteudo: Uint8Array }>` (**método novo**):
  1. Chama `obterArquivo(id)`.
  2. Percorre `armazenamentoArquivos.transferir(arquivo.caminho)` acumulando os blocos num buffer local.
  3. Só ao fim da iteração concatena os blocos e devolve o conteúdo completo.
  4. Se a iteração lançar qualquer erro, descarta os blocos recebidos e lança `DownloadFalhouError` (com `cause`).

  Erros: `TccNaoEncontradoError`, `ArquivoIndisponivelError` e `DownloadFalhouError`.

### `src/service/erros.js`

- `TccNaoEncontradoError(id)`, `ArquivoIndisponivelError(id)` e `DownloadFalhouError(id, { cause })`.

### Camada repository

- `TccRepository` «interface» (classe base; cada método lança `Error("não implementado")`):
  - `salvarTcc(tcc: TCC): void`
  - `buscarPorId(id: number): TCC | null`
  - `buscarPorFiltros(filtros: FiltroBusca): TCC[]`: devolve todos os TCCs (de qualquer status) que atendem a todos os critérios preenchidos do filtro. O filtro vazio devolve todos.
- `TccRepositoryEmMemoria extends TccRepository`: `constructor(tccs?: TCC[])`, guarda os TCCs em um `Map<id, TCC>`. Regras de correspondência (FR-004 a FR-008, FR-003a):
  - `termo`: `normalizarTexto(termo)` precisa estar contido em `normalizarTexto` de pelo menos um destes campos: `titulo`, `resumoSimplificado`, `autor.nome`, `orientador.nome` ou o nome de alguma tag (FR-004, P2).
  - `ano`: igualdade com `tcc.ano`, qualquer semestre (FR-006).
  - `autor`: `minusculas(autor)` contido em `minusculas(tcc.autor.nome)` (FR-007).
  - `orientador`: `minusculas(orientador)` contido em `minusculas(tcc.orientador.nome)`; o coorientador não é considerado (premissa da spec, FR-007).
  - `tags`: cada tag do filtro precisa ser igual, após `normalizarTexto`, ao nome de alguma tag do TCC (E, FR-008, P3).
  - `colecao`: igualdade após `normalizarTexto` com `tcc.colecao`. Um TCC sem coleção não atende (FR-003a, premissa).
  - Todos os critérios preenchidos combinados com E (FR-005).
- `normalizacao.js`:
  - `normalizarTexto(s)`: `String(s).normalize("NFD")`, remove marcas diacríticas (`\p{M}`), `toLocaleLowerCase("pt-BR")`, `trim()`.
  - `minusculas(s)`: só `toLocaleLowerCase("pt-BR")` e `trim()`.
- `ArmazenamentoArquivos` «interface»: `transferir(caminho: string): AsyncIterable<Uint8Array>`. Entrega o conteúdo em blocos e, se a transferência falhar, lança `FalhaTransferenciaError` durante a iteração. O mesmo módulo exporta `FalhaTransferenciaError`.
- `ArmazenamentoArquivosEmMemoria extends ArmazenamentoArquivos`: `constructor(arquivos?: Map<string, Uint8Array>, { tamanhoBloco = 16 } = {})`; `adicionar(caminho, conteudo): void`; `transferir(caminho)` gera cópias dos blocos e lança `FalhaTransferenciaError` se o caminho não existe.
- `dadosIniciais.js`: `criarDadosIniciais(): { tccs: TCC[], arquivos: Map<string, Uint8Array> }` e `IDS_CT03`.

### Camada dto

- `FiltroBusca`: `termo: string | null`, `ano: number | null`, `autor: string | null`, `orientador: string | null`, `tags: string[]`, **`colecao: string | null`**.
  - Construtor `new FiltroBusca(dados?)`: strings são aparadas e as vazias viram `null`; `tags` aceita `string` ou `string[]` e vira um array sem vazios nem repetidos; `ano` aceita número ou string numérica.
  - Erros: `FiltroInvalidoError` (exportado pelo mesmo módulo) quando `ano` não é inteiro.
- `TccDTO`:
  - Campos do diagrama: `id`, `titulo`, `resumoSimplificado`, `ano`, `semestre`, `autor` (nome), `orientador` (nome), `tags: string[]`.
  - Campos acrescentados: `coorientador: string | null`, `colecao: string | null`, `linkLume: string`, `imagens: { caminhoUrl, descricao }[]`, `arquivoDisponivel: boolean`, `formatoArquivo: string | null`.
  - `static deTcc(tcc: TCC): TccDTO` cria o DTO a partir do modelo.
- `ResultadoBuscaDTO`: `tccs: TccDTO[]`, `mensagem: string | null`, `filtro: FiltroBusca`.
- `RespostaDownloadDTO`: `sucesso: boolean`, `arquivo: File | null`, `mensagem: string | null`, `podeTentarNovamente: boolean`.

## Divergências entre especificação e diagramas (constituição, princípio III)

| # | Divergência | Decisão |
|---|---|---|
| D1 | `FiltroBusca` (diagrama) não tem coleção; a spec exige o filtro (FR-003a, P1). | Acrescentar `colecao: string \| null` a `FiltroBusca`. |
| D2 | `TCC` (diagrama) não tem curso de origem; a spec o exige (Entidades-chave, P1). | Acrescentar `colecao: string` a `TCC`, como texto simples, sem criar uma entidade `Colecao` (simplicidade; nenhuma regra exige mais que o nome). |
| D3 | `FiltroBusca.tags: String` (singular) contra várias tags na spec (FR-008). | `tags: string[]`; o construtor também aceita uma string única. |
| D4 | `TccDTO.tags: String` e `TccDTO` sem coorientador, coleção, link do LUME, imagens e indicação de arquivo, mas FR-013 e FR-015a exigem esses dados. | `tags: string[]` e campos acrescentados ao próprio `TccDTO`, em vez de criar outro DTO de detalhes. O mesmo DTO serve ao feed e aos detalhes. |
| D5 | `TccController.buscarTccs(...)` retorna `List<TccDTO>`, mas a interface precisa entregar a mensagem do FA01 e os critérios mantidos (FR-012). | Retornar `ResultadoBuscaDTO { tccs, mensagem, filtro }` (novo DTO). |
| D6 | `TccController.baixarArquivo(id)` retorna `File`, mas a interface precisa entregar a mensagem do FA02 e a possibilidade de nova tentativa (FR-016). | Retornar `Promise<RespostaDownloadDTO>`, que contém o `File` em caso de sucesso. |
| D7 | `TccService` só tem `obterArquivo(id): ArquivoTcc` (metadados); não há operação de transferência, e o diagrama de pacotes não tem o "Armazenamento de Arquivos" que aparece como raia no diagrama de atividades. | `obterArquivo` mantido como no diagrama. Acrescentar `TccService.transferirArquivo(id)` e a interface `ArmazenamentoArquivos` no pacote `repository` (camada de dados), conforme o princípio IV. |
| D8 | O pacote `model` do diagrama de pacotes grafa `ArquivoTCC`; o diagrama de classes grafa `ArquivoTcc`. | Usar `ArquivoTcc` (diagrama de classes, mais detalhado, e nome usado nas restrições do grupo). |
| D9 | Métodos do diagrama de outras funcionalidades: `TCC.publicar/salvarRascunho/validarCamposObrigatorios/registrarVisualizacao`, `TccService.cadastrarTCC/salvarRascunho/editarTCC/listarMaisRecentes/listarTagsMaisExploradas/mapearTrabalhosConexos`, `TccController.obterFeedDestaques/listarTrabalhosConexos/cadastrarTcc/editarTcc`, `TccRepository.buscarMaisRecentes/buscarPorTags`, `TagRepository`, `ValidadorLumeService`, `Area`, `FeedDTO`. | Não implementar (fora de escopo na spec; constituição V). `TccRepository.salvarTcc` é implementado porque é usado para carregar os dados iniciais. O atributo `visualizacoes` é mantido no modelo (valor padrão 0), sem comportamento. |
| D10 | O diagrama de classes liga `TCC` a `Professor` com multiplicidade 1..2, sem papéis; a spec distingue orientador e coorientador. | Dois atributos: `orientador` (obrigatório) e `coorientador` (opcional). |
| D11 | Detalhes no diagrama de atividades incluem "trabalhos conexos". | Não incluídos (spec, Fora de escopo, UC06). |
| D12 | `TccService.buscarPorId` no diagrama é genérico; aqui ele recusa rascunhos (FR-014). | Recusar rascunhos em `buscarPorId` neste escopo. Se UC02 (edição) precisar de rascunhos, cria-se então outro método (ver Riscos). |

## Decisões técnicas

| Decisão | Justificativa | Alternativas descartadas |
|---|---|---|
| Correspondência dos critérios no `TccRepositoryEmMemoria.buscarPorFiltros`; visibilidade (só PUBLICADO) e ordenação no `TccService`. | O diagrama dá ao repositório a consulta `buscarPorFiltros(filtros)` (como uma consulta a banco); "rascunho nunca aparece" é regra de negócio e fica no serviço, que também a aplica em detalhes e download. | Tudo no serviço com um `listarTodos()` no repositório (método fora do diagrama). Tudo no repositório (a regra de visibilidade ficaria espalhada). |
| Termo livre normalizado com NFD e remoção de diacríticos, mais minúsculas e `includes`. | Cumpre FR-004/P2 ("seguranca" encontra "Segurança") com recursos nativos. | Índice invertido ou busca por palavra inteira: mais complexos e contrários à correspondência parcial pedida. |
| Filtros de autor e orientador: só minúsculas e `includes`, sem remover acentos. | É o que FR-007 pede literalmente; a regra de acentos (P2) foi respondida só para o termo livre, e estendê-la seria supor em silêncio (princípio VI). | Usar `normalizarTexto` também nesses filtros (registrado em Riscos como possível ajuste). |
| Tags e coleção: igualdade após `normalizarTexto`. | São valores selecionados de uma lista (UC04: "seleciona os filtros"), então a igualdade é o comportamento esperado; a normalização evita falso negativo por caixa ou acento. | Correspondência parcial ("Rede" casaria "Redes" e "Redes Neurais"), o que diluiria o filtro. |
| Mesmo `TccDTO` para feed e detalhes, sempre completo. | Um só mapeamento, fiel ao único DTO de TCC do diagrama; FR-010 pede "ao menos" os campos resumidos. | `DetalheTccDTO` separado: mais uma classe sem ganho para a spec. |
| O controller devolve DTOs de resposta (`ResultadoBuscaDTO`, `RespostaDownloadDTO`) com a mensagem do caso de uso, em vez de lançar exceção, para "nenhum resultado" e "falha no download". | São fluxos alternativos previstos no UC04, não erros de programação; a interface com o usuário (a API do controller) precisa entregar o texto literal. | Lançar exceções com a mensagem (a UI teria que capturar fluxos normais); devolver `[]` ou `File` puros (perde a mensagem). |
| Exceções (`TccNaoEncontradoError`, `ArquivoIndisponivelError`, `FiltroInvalidoError`) para usos indevidos da API. | Não há mensagem nos casos de uso para esses casos; uma UI conforme a spec não os provoca (só mostra publicados e só oferece o botão quando há arquivo). | Inventar mensagens ao usuário (violaria o princípio III). |
| Download com acúmulo em buffer e entrega só ao final (tudo ou nada). | Garante "nenhum arquivo incompleto" (FR-016, CT06) por construção: o chamador (o "dispositivo") só recebe conteúdo completo. | Escrever direto no destino à medida que chega e apagar em caso de erro (precisaria de uma porta de "dispositivo" e de limpeza, mais complexo). |
| Retornar `File` de `node:buffer`. | É o tipo `File` do diagrama, nativo no Node 20, e carrega nome, tipo MIME e conteúdo. | `Buffer` puro (perde nome e formato); objeto próprio (afasta-se do diagrama). |
| Interfaces como classes base cujos métodos lançam "não implementado". | JavaScript não tem `interface`; a classe base documenta o contrato e permite `instanceof`. | Duck typing sem classe base (contrato implícito); JSDoc apenas. |
| `package.json` só com `"type": "module"` e `"scripts": { "test": "node --test" }`. | Permite ES modules em arquivos `.js`; não há dependências, então nada a instalar. | Extensão `.mjs` em todos os arquivos (funciona, mas é menos legível). |
| Ids numéricos fixos nos dados iniciais (`IDS_CT03`). | Testes legíveis e estáveis ("TCC A" = id 1). | Gerar ids dinamicamente e buscar por título em cada teste. |

## Simulação da falha de download (CT06)

1. `ArmazenamentoArquivosEmMemoria.transferir(caminho)` entrega o conteúdo em blocos de 16 bytes. O PDF fictício do TCC A tem várias dezenas de bytes, ou seja, vários blocos.
2. O dublê `tests/apoio/ArmazenamentoComFalhaSimulada.js` estende `ArmazenamentoArquivos`, envolve um `ArmazenamentoArquivosEmMemoria` e oferece:
   - `interromperConexao({ aposBytes })`: as próximas transferências entregam blocos até somar `aposBytes` e então lançam `FalhaTransferenciaError`, o que simula a queda **durante** a transferência (CT06 passo 3);
   - `restabelecerConexao()`: as transferências voltam a ser completas (CT06 passo 4);
   - `bytesEntregues`: contador para provar que a falha ocorreu depois de bytes terem sido enviados.
3. O teste monta a aplicação com `criarAplicacao({ armazenamentoArquivos: dublê })` e segue o CT06:
   1. Busca e abre o TCC A.
   2. Interrompe a conexão após 20 bytes e chama `baixarArquivo(1)`. Espera `sucesso === false`, `arquivo === null`, a mensagem literal do FA02, `podeTentarNovamente === true` e `bytesEntregues > 0`. O "dispositivo" do teste (uma lista local onde o teste guarda os arquivos recebidos) continua vazio.
   3. Chama `visualizarDetalhes(1)` e espera que funcione, com `arquivoDisponivel === true` ("página continua aberta, botão disponível").
   4. Restabelece a conexão, chama de novo `baixarArquivo(1)` e espera `sucesso === true` e um `File` com `name` = nome original, `type = "application/pdf"` e bytes idênticos aos dos dados iniciais.
   5. Variação: falhas repetidas devolvem sempre a mesma mensagem (sem limite de tentativas).

## Rastreabilidade

| Requisito (FR) | Componente(s) responsável(is) | Teste(s) |
|---|---|---|
| FR-001 (qualquer leitor, sem autenticação) | `TccController` (nenhum método recebe credencial) | `acesso-leitura.test.js`: fluxo buscar → detalhes → baixar sem contexto de usuário (SC-006) |
| FR-002 (não altera dados) | `TccDTO.deTcc` (o controller não expõe o modelo); `TccService` (só leitura) | `acesso-leitura.test.js`: estado do repositório idêntico antes e depois das operações, mesmo alterando os DTOs devolvidos |
| FR-003 (termo + 5 filtros) | `FiltroBusca`, `TccController.buscarTccs` | `busca-tags-colecao.test.js`: pesquisa com os 6 critérios combinados (SC-005) |
| FR-003a (coleção = curso) | `TCC.colecao`, `FiltroBusca.colecao`, `TccRepositoryEmMemoria` | `busca-tags-colecao.test.js`: base com dois cursos, filtro "Ciência da Computação" (História 1, cenário 7) |
| FR-004 (termo livre) | `normalizacao.normalizarTexto`, `TccRepositoryEmMemoria` | `busca-termo-livre.test.js`: "Carlos Lima" → A, B, C (US#04 cen. 3); "seguranca" acha "Segurança" (cen. 10); termo parcial; termo que casa tag; `ct05-*`: "blockchain" |
| FR-005 (critérios simultâneos) | `TccRepositoryEmMemoria.buscarPorFiltros` | `ct03-buscar-filtros-combinados.test.js` (CT03: só A); `ct05-*` (termo + tag) |
| FR-006 (ano, qualquer semestre) | `TccRepositoryEmMemoria` | `ct03-*`: Ano 2025 inclui 2025/1; `busca-tags-colecao.test.js`: base com 2025/1 e 2025/2 |
| FR-007 (autor/orientador parcial, sem caixa) | `normalizacao.minusculas`, `TccRepositoryEmMemoria` | `ct03-*`: "Carlos Lima" casa "Profº Carlos Lima"; `busca-termo-livre.test.js`: filtro de autor parcial e em minúsculas |
| FR-008 (várias tags, E) | `FiltroBusca.tags`, `TccRepositoryEmMemoria` | `busca-tags-colecao.test.js`: {Redes, IA} e {Redes} → só o primeiro (cen. 9); nenhum com todas → mensagem do FA01 |
| FR-009 (só PUBLICADO) | `TccService.buscarPorFiltros` | `ct03-*` (E oculto); `ct05-*` (variação título de E); `busca-sem-criterios.test.js` |
| FR-010 (feed com dados resumidos) | `TccDTO`, `ResultadoBuscaDTO`, `TccService` (ordenação) | `ct03-*`: item A tem título, autor, orientador, ano, semestre, tags e resumo; `busca-sem-criterios.test.js`: ordem ano/semestre desc. |
| FR-011 (sem critérios → todos publicados) | `FiltroBusca` (vazio), `TccService` | `busca-sem-criterios.test.js`: A, B, C, D, sem E (cen. 8, SC-008); base sem publicados → mensagem do FA01 |
| FR-012 (nenhum resultado: mensagem literal, critérios mantidos) | `mensagens.MENSAGEM_NENHUM_RESULTADO`, `ResultadoBuscaDTO.filtro`, `TccController` | `ct03-*` (variação 2023 + Redes); `ct05-*` (passos 3 e 4: reaproveita o `filtro` devolvido, remove o termo e pesquisa de novo → A, C, D) |
| FR-013 (detalhes completos) | `TccService.buscarPorId`, `TccDTO.deTcc`, `TccController.visualizarDetalhes` | `ct03-*` (abrir A); `detalhes.test.js`: todos os campos, coorientador nulo/presente, imagens, link do LUME |
| FR-014 (rascunho inacessível por id) | `TccService.buscarPorId`, `TccNaoEncontradoError` | `detalhes.test.js`: `visualizarDetalhes(5)` e `baixarArquivo(5)` lançam `TccNaoEncontradoError`; id inexistente idem |
| FR-015 (download do arquivo íntegro) | `TccService.transferirArquivo`, `ArmazenamentoArquivos`, `TccController.baixarArquivo` | `ct06-falha-download.test.js` (passo 4: PDF de A idêntico); `detalhes.test.js`: DOCX de B e EPUB de C com tipo MIME correto |
| FR-015a (sem arquivo: sem botão, com link LUME) | `TccDTO.arquivoDisponivel`, `TccService.obterArquivo`, `ArquivoIndisponivelError` | `detalhes.test.js`: D tem `arquivoDisponivel === false` e `linkLume` preenchido; `baixarArquivo(4)` lança `ArquivoIndisponivelError` (SC-007) |
| FR-016 (falha: mensagem literal, nada parcial, nova tentativa) | `TccService.transferirArquivo` (tudo ou nada), `DownloadFalhouError`, `mensagens.MENSAGEM_FALHA_DOWNLOAD`, `RespostaDownloadDTO` | `ct06-falha-download.test.js` (passos 2 a 5 da seção de simulação) |

Os casos de teste do relatório aparecem assim: CT03 em `ct03-buscar-filtros-combinados.test.js`, CT05 em `ct05-busca-sem-correspondencia.test.js` e CT06 em `ct06-falha-download.test.js`.

## Riscos e pontos em aberto

- **Mensagem para TCC inexistente ou rascunho acessado por id:** o UC04 não define nenhuma. A API lança `TccNaoEncontradoError`, e uma interface que siga a spec não provoca esse caso. Se for preciso um texto ao usuário, ele terá de ser definido pelo grupo.
- **Curso de origem depende do cadastro:** UC01/RF#01 ainda não coletam a coleção (D2). Os dados iniciais a preenchem diretamente. Quando o cadastro for especificado, o campo precisa entrar lá.
- **`buscarPorId` restrito a publicados (D12):** pode conflitar com UC02 (edição de rascunhos) numa funcionalidade futura.
- **Acentos nos filtros de autor/orientador:** por fidelidade literal ao FR-007, "Jose" não casa "José" nesses filtros, embora case no termo livre. Se o grupo preferir uniformidade, basta trocar `minusculas` por `normalizarTexto` (mudança local).
- **Ordem dos resultados:** é premissa da spec, não requisito do relatório; os testes de ordem verificam a premissa e não um CT.
- **`File` global:** o código importa `File` de `node:buffer` explicitamente, para não depender do global, que varia entre versões do Node.
- **Coorientador:** não entra no filtro de orientador nem no termo livre (premissa da spec, FR-004). Pode precisar de revisão se o grupo quiser achar trabalhos coorientados.

## Quickstart

Pré-requisito: Node.js 20 ou superior (`node --version`). Não há `npm install`.

```text
# na raiz (pasta claude-code)
node --test            # executa todos os testes em tests/
npm test               # equivalente (só chama node --test)
node --test tests/ct03-buscar-filtros-combinados.test.js   # um caso de teste específico
```

Como exercitar os cenários da especificação pela API pública (ex.: num script ES module na raiz):

1. `const { tccController } = criarAplicacao();` monta a aplicação com os TCCs A–E do CT03.
2. **CT03:** `tccController.buscarTccs({ ano: 2025, orientador: "Carlos Lima", tags: ["Redes"] })` retorna `tccs` só com o TCC A e `mensagem: null`. Com `{ ano: 2023, tags: ["Redes"] }`, retorna `tccs: []` e a mensagem do FA01.
3. **CT05:** `buscarTccs({ termo: "blockchain", tags: ["Redes"] })` retorna vazio, com a mensagem. Depois, `buscarTccs({ ...resultado.filtro, termo: null })` retorna A, C e D.
4. **Detalhes:** `tccController.visualizarDetalhes(1)` retorna o `TccDTO` completo de A. `visualizarDetalhes(4)` tem `arquivoDisponivel: false` e `linkLume`. `visualizarDetalhes(5)` lança `TccNaoEncontradoError`.
5. **Download:** `await tccController.baixarArquivo(1)` retorna `{ sucesso: true, arquivo: File(PDF) }`.
6. **CT06 (falha):** montar com `criarAplicacao({ armazenamentoArquivos: new ArmazenamentoComFalhaSimulada(...) })`, chamar `interromperConexao({ aposBytes: 20 })` e então `baixarArquivo(1)`, que devolve `sucesso: false` com a mensagem do FA02. Depois de `restabelecerConexao()`, nova chamada devolve `sucesso: true`.
