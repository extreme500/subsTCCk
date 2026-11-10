# Tarefas: Buscar e Filtrar TCCs

**Entrada:** `spec.md` e `plan.md` em `specs/001-buscar-filtrar-tccs/`

## Formato

`- [ ] T001 [P] [H1] Descrição com o caminho do arquivo — origem: FR-xxx / CTxx`

- `[P]`: pode ser feita em paralelo (arquivos diferentes, sem dependência).
- `[H1]`, `[H2]`...: história da especificação que a tarefa atende.
- Testes vêm antes da implementação que verificam.

Convenções:
- Todo `test(...)` deve citar no nome o CT ou FR que verifica (ex.: `"CT03: ..."`, `"FR-008: ..."`), conforme a constituição, princípio I.
- Os caminhos são relativos à raiz do projeto (pasta `claude-code`).
- "D1"..."D12" referem-se às divergências registradas no `plan.md`.

## Fase 1: Preparação

- [x] T001 Criar `package.json` na raiz, só com `"type": "module"` e `"scripts": { "test": "node --test" }` e sem `dependencies`. Criar as pastas `src/controller`, `src/service`, `src/repository`, `src/model`, `src/dto` e `tests/apoio`. — origem: plan (Contexto técnico, Estrutura); constituição V

## Fase 2: Base (bloqueia as histórias)

Esta fase cria o modelo, os contratos e a montagem da aplicação, sem comportamento de busca, detalhes ou download. Esse comportamento é verificado pelos testes de cada história, escritos antes da implementação correspondente.

- [x] T002 [P] Criar as enumerações congeladas `StatusTcc` (RASCUNHO, PUBLICADO) e `FormatoArquivo` (DOCX, PDF, EPUB) em `src/model/StatusTcc.js` e `src/model/FormatoArquivo.js`. — origem: FR-009, FR-014, FR-015
- [x] T003 [P] Criar `Usuario` «abstract» (o construtor recusa instância direta), `Professor` (departamento) e `AlunoFormando` (matricula) em `src/model/Usuario.js`, `src/model/Professor.js` e `src/model/AlunoFormando.js`. — origem: FR-004, FR-007, FR-013
- [x] T004 [P] Criar `Tag` (id, nome), `Midia` (id, caminhoUrl, descricao) e `ArquivoTcc` (nomeOriginal, formato, caminho) em `src/model/Tag.js`, `src/model/Midia.js` e `src/model/ArquivoTcc.js`. — origem: FR-008, FR-013, FR-015 (D8)
- [x] T005 Criar `TCC` em `src/model/TCC.js`, com os atributos do diagrama, `colecao` (D2), `autor`, `orientador`, `coorientador` opcional (D10), `tags`, `midias` e `arquivo` opcional; `visualizacoes` vale 0 por padrão e não há métodos de UC01/feed (D9). — origem: FR-003a, FR-013, FR-015a
- [x] T006 [P] Criar `TccNaoEncontradoError`, `ArquivoIndisponivelError` e `DownloadFalhouError` (com `cause`) em `src/service/erros.js`. — origem: FR-014, FR-015a, FR-016
- [x] T007 [P] Criar `MENSAGEM_NENHUM_RESULTADO` e `MENSAGEM_FALHA_DOWNLOAD` em `src/controller/mensagens.js`, com o texto literal do UC04 FA01 e FA02. — origem: FR-012, FR-016; UC04 FA01/FA02; constituição III
- [x] T008 [P] Criar a classe base «interface» `TccRepository` (`salvarTcc`, `buscarPorId`, `buscarPorFiltros` lançando "não implementado") em `src/repository/TccRepository.js`. — origem: plan (Contratos); constituição IV
- [x] T009 Criar `TccRepositoryEmMemoria` em `src/repository/TccRepositoryEmMemoria.js`, com construtor (`tccs?`), `salvarTcc` e `buscarPorId` (que devolve `null` se o id não existe). `buscarPorFiltros` fica para T027. — origem: FR-009, FR-014 (base); plan (Contratos)
- [x] T010 [P] Criar a classe base «interface» `ArmazenamentoArquivos` (`transferir(caminho): AsyncIterable<Uint8Array>`) e `FalhaTransferenciaError` em `src/repository/ArmazenamentoArquivos.js`. — origem: FR-015, FR-016 (D7); constituição IV
- [x] T011 Criar `ArmazenamentoArquivosEmMemoria` em `src/repository/ArmazenamentoArquivosEmMemoria.js`, com `Map`, `adicionar`, `transferir` em blocos (`tamanhoBloco = 16`, cópias dos bytes) e `FalhaTransferenciaError` para caminho inexistente. — origem: FR-015; CT06
- [x] T012 Criar `criarDadosIniciais()` e `IDS_CT03` em `src/repository/dadosIniciais.js`. Os TCCs A–E seguem a tabela do plan: CT03 literal, coleção "Ciência da Computação", nenhum texto com "blockchain", A com PDF, B com DOCX, C com EPUB, D sem arquivo e E em rascunho com PDF; cada conteúdo tem mais de um bloco. — origem: CT03, CT05, CT06; FR-015a
- [x] T013 [P] Criar em `tests/apoio/fabricas.js` funções que montam TCCs e bases específicas (outro curso, várias tags, acentos, coorientador, imagens, semestres 1 e 2), para injetar via `dadosIniciais`. — origem: FR-003a, FR-004, FR-006, FR-008, FR-013
- [x] T014 Criar os esqueletos `TccService` (construtor com `{ tccRepository, armazenamentoArquivos }`) e `TccController` (construtor com `tccService`), sem métodos de negócio, em `src/service/TccService.js` e `src/controller/TccController.js`. — origem: plan (Contratos); constituição IV
- [x] T015 Criar `criarAplicacao(opcoes)` em `src/app.js`. A função aceita `tccRepository`, `armazenamentoArquivos` e `dadosIniciais` injetados; por padrão usa os repositórios em memória com `criarDadosIniciais()`. Retorna `{ tccController, tccService, tccRepository, armazenamentoArquivos }`. — origem: plan (Contratos de `app.js`, Simulação da falha); CT06

**Ponto de verificação:** `node --test` roda sem erro de carregamento (ainda não há testes).

## Fase 3: História 1 - Encontrar TCCs combinando termo e filtros (P1)

**Objetivo:** o leitor pesquisa com termo livre e/ou filtros (ano, autor, orientador, tags, coleção) e recebe, em feed, só os TCCs publicados que atendem a todos os critérios; quando nada é encontrado, recebe a mensagem do FA01 e os critérios usados, para ajustar e pesquisar de novo.
**Teste independente:** com a base de CT03 (A–E), executar as combinações de CT03 e CT05 por `tccController.buscarTccs` e conferir os TCCs devolvidos e a mensagem.

### Testes da História 1 (escrever primeiro e confirmar que falham)

- [x] T016 [P] [H1] Escrever `tests/ct03-buscar-filtros-combinados.test.js` (CT03, passos 1 a 3, e a variação):
  - Ano 2025 + Orientador "Carlos Lima" + Tag "Redes" devolve só o A, com `mensagem` nula e o item A trazendo título, autor, orientador, ano, semestre, tags e resumo;
  - Ano 2023 + Tag "Redes" devolve `tccs` vazio e `MENSAGEM_NENHUM_RESULTADO` com igualdade estrita.

  — origem: CT03; FR-005, FR-006, FR-007, FR-009, FR-010, FR-012; SC-001
- [x] T017 [P] [H1] Escrever `tests/ct05-busca-sem-correspondencia.test.js` (CT05):
  - passo 3: "blockchain" + Tag "Redes" dá feed vazio com a mensagem literal;
  - passo 4: reutiliza `resultado.filtro`, remove o termo e pesquisa de novo, recebendo A, C e D, sem E;
  - variação: o título do TCC E dá a mensagem literal.

  — origem: CT05; FR-004, FR-005, FR-009, FR-012; SC-002, SC-003
- [x] T018 [P] [H1] Escrever `tests/busca-termo-livre.test.js`:
  - termo "Carlos Lima" devolve A, B e C (US#04, cenário 3);
  - "seguranca" encontra resumo com "Segurança" (cenário 10, base de `fabricas`);
  - termo parcial e com caixa diferente;
  - termo que casa nome de tag e termo que casa nome de autor;
  - filtro de autor parcial em minúsculas (FR-007);
  - o coorientador não é considerado pelo filtro de orientador (premissa da spec).

  — origem: FR-004, FR-007; US#04
- [x] T019 [P] [H1] Escrever `tests/busca-tags-colecao.test.js`:
  - tags {Redes, IA} contra {Redes}: só o TCC com as duas (cenário 9);
  - várias tags sem nenhum TCC com todas: mensagem do FA01;
  - coleção "Ciência da Computação" contra outro curso (cenário 7);
  - ano casa os semestres 1 e 2;
  - pesquisa com os 6 critérios combinados (SC-005);
  - `tags` como string única;
  - `ano` não inteiro lança `FiltroInvalidoError`.

  — origem: FR-003, FR-003a, FR-006, FR-008; US#04 cenário 2; SC-005
- [x] T020 [P] [H1] Escrever `tests/busca-sem-criterios.test.js`:
  - filtro vazio (`{}` e `new FiltroBusca()`) devolve A, B, C e D, sem E;
  - a ordem é ano/semestre decrescente e título crescente;
  - base sem publicados dá a mensagem do FA01.

  — origem: FR-011, FR-009, FR-010; SC-008
- [x] T021 [P] [H1] Escrever `tests/acesso-leitura.test.js`, parte da busca:
  - `buscarTccs` funciona sem nenhum dado de usuário ou credencial;
  - o estado do repositório (snapshot dos TCCs) fica idêntico depois de buscar e de alterar os DTOs devolvidos.

  — origem: FR-001, FR-002
- [x] T022 [H1] Executar `node --test` e confirmar que T016–T021 falham porque `buscarTccs`, `FiltroBusca`, `TccDTO` etc. ainda não existem. — origem: constituição II

### Implementação da História 1

- [x] T023 [P] [H1] Implementar `normalizarTexto` (NFD, remoção de `\p{M}`, minúsculas pt-BR, trim) e `minusculas` em `src/repository/normalizacao.js`. — origem: FR-004, FR-007
- [x] T024 [P] [H1] Implementar `FiltroBusca` em `src/dto/FiltroBusca.js`, com termo, ano, autor, orientador, `tags: string[]`, `colecao`, as normalizações de entrada e `FiltroInvalidoError`. — origem: FR-003, FR-003a, FR-008, FR-011 (D1, D3)
- [x] T025 [P] [H1] Implementar `TccDTO` e `TccDTO.deTcc(tcc)` em `src/dto/TccDTO.js`, com os campos do diagrama e os acrescentados (D4). Arrays e objetos são sempre novos, sem referências ao modelo. — origem: FR-010, FR-013, FR-015a, FR-002
- [x] T026 [P] [H1] Implementar `ResultadoBuscaDTO { tccs, mensagem, filtro }` em `src/dto/ResultadoBuscaDTO.js`. — origem: FR-012 (D5)
- [x] T027 [H1] Implementar `TccRepositoryEmMemoria.buscarPorFiltros(filtros)` em `src/repository/TccRepositoryEmMemoria.js`, com as regras de correspondência do plan (termo, ano, autor, orientador, tags com E, coleção, tudo combinado com E). Depende de T023 e T024. — origem: FR-003a, FR-004, FR-005, FR-006, FR-007, FR-008
- [x] T028 [H1] Implementar `TccService.buscarPorFiltros(filtro)` em `src/service/TccService.js`: mantém só `PUBLICADO` e ordena por ano desc., semestre desc. e título asc. (pt-BR). Depende de T027. — origem: FR-009, FR-010, FR-011
- [x] T029 [H1] Implementar `TccController.buscarTccs(filtro)` em `src/controller/TccController.js`, convertendo o objeto em `FiltroBusca`, mapeando para `TccDTO` e usando `MENSAGEM_NENHUM_RESULTADO` quando vazio. Depende de T024–T026 e T028. — origem: FR-003, FR-011, FR-012
- [x] T030 [H1] Executar `node --test` e confirmar que T016–T021 passam. — origem: constituição II

**Ponto de verificação:** a História 1 funciona e é testável sozinha.

## Fase 4: História 2 - Ver os detalhes de um TCC encontrado (P2)

**Objetivo:** ao selecionar um TCC publicado, o leitor recebe todos os dados preenchidos pelo autor, o link do LUME e a indicação de que o botão "Baixar Artigo" está ou não disponível; rascunhos e ids inexistentes não são apresentados.
**Teste independente:** `tccController.visualizarDetalhes(IDS_CT03.A)` sem passar pela busca, conferindo os campos; D sem arquivo; E em rascunho.

### Testes da História 2 (escrever primeiro e confirmar que falham)

- [x] T031 [P] [H2] Escrever `tests/detalhes.test.js`, parte de visualização:
  - A traz todos os campos do FR-013;
  - TCC com coorientador e imagens (base de `fabricas`) os apresenta, e sem coorientador o campo vem `null`;
  - D tem `arquivoDisponivel === false` e `linkLume` preenchido;
  - A tem `arquivoDisponivel === true` e `formatoArquivo === "PDF"`;
  - E e um id inexistente lançam `TccNaoEncontradoError`.

  — origem: FR-013, FR-014, FR-015a; US#04 cenário 1; SC-007
- [x] T032 [P] [H2] Acrescentar a `tests/ct03-buscar-filtros-combinados.test.js` o passo 4 do CT03: abrir o TCC A listado e conferir as informações preenchidas pelo autor. — origem: CT03; FR-013
- [x] T033 [P] [H2] Acrescentar a `tests/acesso-leitura.test.js` a parte de detalhes: funciona sem credencial e alterar o DTO devolvido não altera o repositório. — origem: FR-001, FR-002
- [x] T034 [H2] Executar `node --test` e confirmar que T031–T033 falham. — origem: constituição II

### Implementação da História 2

- [x] T035 [H2] Implementar `TccService.buscarPorId(id)` em `src/service/TccService.js`, lançando `TccNaoEncontradoError` se o TCC não existe ou não é `PUBLICADO`. — origem: FR-014 (D12)
- [x] T036 [H2] Implementar `TccController.visualizarDetalhes(id)` em `src/controller/TccController.js`, devolvendo `TccDTO.deTcc`. Depende de T035. — origem: FR-013, FR-015a
- [x] T037 [H2] Executar `node --test` e confirmar que todos os testes até aqui passam. — origem: constituição II

**Ponto de verificação:** as Histórias 1 e 2 funcionam de forma independente.

## Fase 5: História 3 - Baixar o arquivo do TCC, com nova tentativa em caso de falha (P3)

**Objetivo:** o leitor baixa o arquivo íntegro no formato anexado; se a transferência cair, recebe a mensagem literal do FA02, não recebe nada parcial, a página continua com o botão disponível e pode tentar de novo sem limite.
**Teste independente:** CT06 com o dublê de armazenamento: interromper após alguns bytes, depois restabelecer e baixar o PDF do TCC A.

### Testes da História 3 (escrever primeiro e confirmar que falham)

- [x] T038 [P] [H3] Criar o dublê `ArmazenamentoComFalhaSimulada` em `tests/apoio/ArmazenamentoComFalhaSimulada.js`. Ele estende `ArmazenamentoArquivos`, envolve o armazenamento em memória e oferece `interromperConexao({ aposBytes })`, `restabelecerConexao()` e `bytesEntregues`. — origem: CT06; plan (Simulação da falha)
- [x] T039 [H3] Escrever `tests/ct06-falha-download.test.js`. Depende de T038.
  - Passo 1: buscar e abrir A.
  - Passos 2–3: interromper após 20 bytes e baixar; esperar `sucesso === false`, `arquivo === null`, `MENSAGEM_FALHA_DOWNLOAD` literal, `podeTentarNovamente === true`, `bytesEntregues > 0` e o "dispositivo" do teste vazio; `visualizarDetalhes(A)` continua com `arquivoDisponivel === true`.
  - Passo 4: restabelecer e baixar; esperar um `File` com o nome original, `type "application/pdf"` e bytes idênticos aos dos dados iniciais.
  - Variação: várias falhas seguidas trazem sempre a mesma mensagem.

  — origem: CT06; FR-015, FR-016; SC-004
- [x] T040 [P] [H3] Acrescentar a `tests/detalhes.test.js` a parte de download:
  - B devolve DOCX e C devolve EPUB, com o MIME correto e o conteúdo íntegro;
  - `baixarArquivo(D)` lança `ArquivoIndisponivelError`;
  - `baixarArquivo(E)` e `baixarArquivo` de id inexistente lançam `TccNaoEncontradoError`.

  — origem: FR-014, FR-015, FR-015a
- [x] T041 [P] [H3] Acrescentar a `tests/acesso-leitura.test.js` o fluxo completo buscar → detalhes → baixar sem credencial, com o repositório inalterado ao final. — origem: FR-001, FR-002; SC-006
- [x] T042 [H3] Executar `node --test` e confirmar que T039–T041 falham. — origem: constituição II

### Implementação da História 3

- [x] T043 [P] [H3] Implementar `RespostaDownloadDTO { sucesso, arquivo, mensagem, podeTentarNovamente }` em `src/dto/RespostaDownloadDTO.js`. — origem: FR-016 (D6)
- [x] T044 [H3] Implementar `TccService.obterArquivo(id)` em `src/service/TccService.js`, usando `buscarPorId` e lançando `ArquivoIndisponivelError` quando não há arquivo. — origem: FR-014, FR-015a
- [x] T045 [H3] Implementar `TccService.transferirArquivo(id)` em `src/service/TccService.js`. Depende de T044.
  - Acumula os blocos de `armazenamentoArquivos.transferir(caminho)` e devolve `{ arquivo, conteudo }` só ao final.
  - Em qualquer erro, descarta os blocos e lança `DownloadFalhouError` com `cause`.

  — origem: FR-015, FR-016 (D7)
- [x] T046 [H3] Implementar `TccController.baixarArquivo(id)` em `src/controller/TccController.js`. Depende de T043 e T045.
  - Cria um `File` (de `node:buffer`) com `nomeOriginal` e o MIME do formato.
  - Converte `DownloadFalhouError` em resposta com `MENSAGEM_FALHA_DOWNLOAD` e `podeTentarNovamente: true`.
  - Deixa propagar `TccNaoEncontradoError` e `ArquivoIndisponivelError`.

  — origem: FR-015, FR-016
- [x] T047 [H3] Executar `node --test` e confirmar que todos os testes passam. — origem: constituição II

**Ponto de verificação:** as três histórias funcionam e o CT06 passa.

## Fase 6: Acabamento

- [x] T048 Executar a suíte completa com Node.js 20+ numa cópia limpa (sem `node_modules`, sem `npm install`) via `node --test` e `npm test`. — origem: plan (Contexto técnico, Quickstart); constituição V
- [x] T049 [P] Conferir a rastreabilidade: todo `test(...)` cita CT/FR, todo FR da spec tem ao menos um teste e a tabela de rastreabilidade do `plan.md` corresponde aos arquivos reais. Registrar diferenças em "Desvios durante a implementação". — origem: constituição I
- [x] T050 [P] Conferir caractere a caractere que `src/controller/mensagens.js` reproduz o texto do UC04 FA01 e FA02 e que nenhum outro texto ao usuário foi inventado. — origem: FR-012, FR-016; constituição III
- [x] T051 [P] Exercitar os passos 1 a 6 do Quickstart do `plan.md` e corrigir o plano se algum passo estiver desatualizado. — origem: plan (Quickstart)
- [x] T052 Registrar em "Desvios durante a implementação" (abaixo) tudo o que mudou em relação ao `plan.md` e por quê. — origem: constituição III e VI

## Dependências e ordem de execução

**Entre fases**
- Fase 1 (T001) → Fase 2 (T002–T015) → Histórias (Fases 3, 4, 5) → Fase 6.
- A Fase 2 bloqueia todas as histórias: o modelo, os contratos, os dados iniciais e o `app.js` são usados por todos os testes.
- As histórias seguem a ordem de prioridade H1 → H2 → H3, porque editam os mesmos arquivos de produção (`TccService.js`, `TccController.js`) e alguns arquivos de teste (`ct03-*`, `detalhes.test.js`, `acesso-leitura.test.js`).
- Funcionalmente, H2 e H3 não dependem de H1: os testes de H2/H3 abrem TCCs por id, e só T032 e o passo 1 de T039 usam a busca. Com coordenação de arquivos, H2 pode começar logo após a Fase 2.
- Dentro de cada história, a ordem é testes → execução confirmando a falha → implementação → execução confirmando a aprovação (constituição II).

**Dentro da Fase 2**
- T002, T003, T004, T006, T007, T008 e T010 são independentes entre si [P].
- T005 depende de T002–T004.
- T009 depende de T005 e T008.
- T011 depende de T010.
- T012 e T013 dependem de T005.
- T014 depende de T006.
- T015 depende de T009, T011, T012 e T014.

**Dentro da Fase 3 (H1)**
- T016–T021 são paralelos entre si [P] (arquivos distintos) e dependem só da Fase 2.
- T022 depende de T016–T021.
- T023–T026 são paralelos [P].
- T027 depende de T023 e T024; T028 de T027; T029 de T024–T026 e T028; T030 de T029.

**Dentro da Fase 4 (H2)**
- T031–T033 são paralelos [P] (arquivos distintos).
- T034 depende deles; T035 → T036 → T037.

**Dentro da Fase 5 (H3)**
- T038, T040 e T041 são paralelos [P].
- T039 depende de T038; T042 depende de T039–T041.
- T043 é [P] em relação a T044–T045.
- T044 → T045 → T046 (que também depende de T043) → T047.

**Fase 6**
- T048 primeiro; T049, T050 e T051 em paralelo [P]; T052 por último.

**Arquivos editados por mais de uma tarefa (nunca em paralelo entre si)**
- `src/repository/TccRepositoryEmMemoria.js`: T009, T027.
- `src/service/TccService.js`: T014, T028, T035, T044, T045.
- `src/controller/TccController.js`: T014, T029, T036, T046.
- `tests/ct03-buscar-filtros-combinados.test.js`: T016, T032.
- `tests/detalhes.test.js`: T031, T040.
- `tests/acesso-leitura.test.js`: T021, T033, T041.

## Desvios durante a implementação

<!-- Preenchido na fase Implement: o que mudou em relação ao plano e por quê. -->

1. **Versão do Node usada na verificação (T048):**
   - O ambiente do experimento só tem Node.js v26.13.0; não havia Node 20 disponível para rodar a suíte.
   - O código usa apenas recursos presentes no Node 20: `node:test`, `node:assert/strict`, `File` de `node:buffer`, `for await`, regex com `\p{M}` e `String.prototype.normalize`.
   - Recomenda-se repetir `node --test` num Node 20 para fechar a verificação.
2. **"Cópia limpa" (T048):** a suíte não foi rodada numa cópia fora do workspace, porque a regra de isolamento do experimento proíbe escrever fora dele. O workspace não tem `node_modules` e o `package.json` não tem dependências, o que dá o mesmo resultado; `node --test` e `npm test` foram executados ali.
3. **`package.json` (T001):** além de `"type"` e `"scripts"`, inclui `name`, `version`, `description`, `private` e `engines` (`"node": ">=20"`). São campos só descritivos, sem dependências, que documentam a versão mínima exigida.
4. **Ordenação (T028):** além de ano desc., semestre desc. e título asc. (plan), há um desempate final por `id`. Isso deixa a ordem determinística quando dois TCCs têm o mesmo título no mesmo semestre e não muda nenhum caso previsto no plan.
5. **Teste do CT06, passo 1 (T039):** já passava antes da implementação da História 3, porque só usa busca e detalhes (Histórias 1 e 2). Os demais testes do CT06 e os de download falharam antes da implementação, como exige a constituição, princípio II: 9 falhas em T042.
6. **Testes a mais no CT06 (T039):** além dos passos do plan, foi acrescentado o caso "falha antes do primeiro byte" (`aposBytes: 0`), que verifica a mesma mensagem do FA02. Origem: FR-016.
7. **Apoio a testes (T013):** `tests/apoio/fabricas.js` ganhou `fotografarRepositorio(tccRepository)`, usado pelos testes de FR-002 para comparar o estado do repositório antes e depois. Para isso, os testes leem `tccRepository.tccs`, o `Map` interno do repositório em memória.
8. **T051 (Quickstart):** os passos 1 a 6 do Quickstart do `plan.md` foram executados e produziram os resultados descritos. Não foi preciso corrigir o plano, que também não pode ser alterado nesta fase.
9. **Rastreabilidade (T049):** todos os 53 `test(...)` citam CT ou FR no nome, e todos os FRs da spec (FR-001 a FR-016, incluindo FR-003a e FR-015a) têm pelo menos um teste. A tabela do `plan.md` corresponde aos arquivos reais; além do previsto, `busca-tags-colecao.test.js` também cobre FR-005 (SC-005).
10. **Mensagens (T050):** as duas constantes de `src/controller/mensagens.js` foram comparadas caractere a caractere com o UC04 FA01 e FA02 em `contexto/relatorio-etapa1.md` e coincidem. Nenhum outro texto ao usuário existe em `src/`.
